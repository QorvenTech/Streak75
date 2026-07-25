import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { createInitialState, DEFAULT_SETTINGS } from '../data/defaults';
import { suggestSubjectIcon } from '../constants/subjectIconMap';
import {
  queueRecordDelete,
  queueRecordWrite,
  queueSubjectDelete,
  queueSubjectWrite,
  queueUserSettingsWrite,
} from '../services/cloud';
import { sendLowAttendanceAlert } from '../services/notifications';
import {
  AttendanceStatus,
  PersistedAppState,
  Subject,
  UserProfile,
  UserSettings,
} from '../types';
import { attendancePercentage } from '../utils/attendance';
import { addUsageDate } from '../utils/googleBackupPrompt';
import {
  recalculateSubjectTotals,
  removeSubjectRecord,
  saveSubjectRecord,
} from '../utils/records';

const STORAGE_KEY = '@streak75/state/v1';

function normalizeSubject(subject: Subject): Subject {
  const calculated = recalculateSubjectTotals(subject);
  if (calculated.iconId) {
    return {
      ...calculated,
      iconSelectionSource: calculated.iconSelectionSource ?? 'manual',
    };
  }
  return {
    ...calculated,
    iconId: suggestSubjectIcon(calculated.name).id,
    iconSelectionSource: 'auto',
  };
}

interface AppContextValue extends PersistedAppState {
  hydrated: boolean;
  selectedSubject: Subject | undefined;
  saveAttendanceRecord: (
    subjectId: string,
    date: string,
    status: AttendanceStatus,
    note: string,
  ) => void;
  removeAttendanceRecord: (subjectId: string, date: string) => void;
  markAttendance: (subjectId: string, date: string, status: AttendanceStatus) => void;
  upsertNote: (subjectId: string, date: string, note: string) => void;
  addSubject: (
    input: Pick<Subject, 'name' | 'professor' | 'icon' | 'color'> &
      Partial<
        Pick<
          Subject,
          | 'iconId'
          | 'iconSelectionSource'
          | 'classesHeld'
          | 'classesAttended'
        >
      >,
  ) => string;
  updateSubject: (subjectId: string, update: Partial<Subject>) => void;
  deleteSubject: (subjectId: string) => void;
  toggleFavorite: (subjectId: string) => void;
  setSelectedSubjectId: (subjectId: string | null) => void;
  updateSettings: (update: Partial<UserSettings>) => void;
  resetSettings: () => void;
  updateProfile: (update: Partial<UserProfile>) => void;
  markGoogleBackupPromptShown: () => void;
  replaceFromCloud: (state: Partial<PersistedAppState>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PersistedAppState>(createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored || !active) return;
        const parsed = JSON.parse(stored) as Partial<PersistedAppState>;
        const storedPrompt = parsed.googleBackupPrompt;
        setState((current) => ({
          ...current,
          ...parsed,
          subjects: Array.isArray(parsed.subjects)
            ? parsed.subjects.map(normalizeSubject)
            : current.subjects.map(normalizeSubject),
          settings: { ...current.settings, ...parsed.settings },
          profile: { ...current.profile, ...parsed.profile },
          googleBackupPrompt: {
            ...current.googleBackupPrompt,
            ...storedPrompt,
            usageDates: Array.isArray(storedPrompt?.usageDates)
              ? storedPrompt.usageDates
              : current.googleBackupPrompt.usageDates,
            subjectsAddedCount:
              typeof storedPrompt?.subjectsAddedCount === 'number'
                ? storedPrompt.subjectsAddedCount
                : (parsed.subjects?.length ?? 0),
          },
        }));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return;
    const recordToday = () => {
      setState((current) => {
        const nextPrompt = addUsageDate(current.googleBackupPrompt);
        return nextPrompt === current.googleBackupPrompt
          ? current
          : { ...current, googleBackupPrompt: nextPrompt };
      });
    };
    const timeout = setTimeout(recordToday, 0);
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') recordToday();
    });
    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [hydrated]);

  const saveAttendanceRecord = useCallback(
    (
      subjectId: string,
      date: string,
      status: AttendanceStatus,
      note: string,
    ) => {
      const item = state.subjects.find((subject) => subject.id === subjectId);
      if (!item) return;
      const { subject: nextSubject, record } = saveSubjectRecord(
        item,
        date,
        status,
        note,
      );
      setState((current) => ({
        ...current,
        selectedSubjectId: subjectId,
        subjects: current.subjects.map((subject) =>
          subject.id === subjectId ? nextSubject : subject,
        ),
      }));
      queueRecordWrite(nextSubject, record).catch(() => undefined);

      const atRisk = state.settings.colorBands.find(
        (band) => band.id === 'at-risk',
      );
      const threshold = atRisk?.minimum ?? 60;
      const before = attendancePercentage(item.classesAttended, item.classesHeld);
      const after = attendancePercentage(
        nextSubject.classesAttended,
        nextSubject.classesHeld,
      );
      if (
        state.settings.notifications.lowAttendanceAlertEnabled &&
        before >= threshold &&
        after < threshold
      ) {
        sendLowAttendanceAlert(item.name, after).catch(() => undefined);
      }
    },
    [state.settings.colorBands, state.settings.notifications, state.subjects],
  );

  const markAttendance = useCallback(
    (subjectId: string, date: string, status: AttendanceStatus) => {
      const item = state.subjects.find((subject) => subject.id === subjectId);
      if (!item) return;
      saveAttendanceRecord(
        subjectId,
        date,
        status,
        item.records[date]?.note ?? '',
      );
    },
    [saveAttendanceRecord, state.subjects],
  );

  const upsertNote = useCallback(
    (subjectId: string, date: string, note: string) => {
      const item = state.subjects.find((subject) => subject.id === subjectId);
      if (!item) return;
      const previous = item.records[date];
      if (!previous && !note.trim()) return;
      saveAttendanceRecord(
        subjectId,
        date,
        previous?.status ?? 'no-class',
        note,
      );
    },
    [saveAttendanceRecord, state.subjects],
  );

  const removeAttendanceRecord = useCallback(
    (subjectId: string, date: string) => {
      const item = state.subjects.find((subject) => subject.id === subjectId);
      if (!item?.records[date]) return;
      const nextSubject = removeSubjectRecord(item, date);
      setState((current) => ({
        ...current,
        subjects: current.subjects.map((subject) =>
          subject.id === subjectId ? nextSubject : subject,
        ),
      }));
      Promise.all([
        queueSubjectWrite(nextSubject),
        queueRecordDelete(subjectId, date),
      ]).catch(() => undefined);
    },
    [state.subjects],
  );

  const addSubject = useCallback(
    (
      input: Pick<Subject, 'name' | 'professor' | 'icon' | 'color'> &
        Partial<
          Pick<
            Subject,
            | 'iconId'
            | 'iconSelectionSource'
            | 'classesHeld'
            | 'classesAttended'
          >
        >,
    ): string => {
      const id = Crypto.randomUUID();
      const now = new Date().toISOString();
      const classesHeld = Math.max(0, Math.round(input.classesHeld ?? 0));
      const classesAttended = Math.min(
        classesHeld,
        Math.max(0, Math.round(input.classesAttended ?? 0)),
      );
      const next: Subject = {
        ...input,
        id,
        iconId: input.iconId ?? suggestSubjectIcon(input.name).id,
        iconSelectionSource: input.iconSelectionSource ?? 'auto',
        favorite: false,
        openingClassesHeld: classesHeld,
        openingClassesAttended: classesAttended,
        classesHeld,
        classesAttended,
        records: {},
        createdAt: now,
        updatedAt: now,
      };
      setState((current) => ({
        ...current,
        subjects: [...current.subjects, next],
        selectedSubjectId: id,
        googleBackupPrompt: {
          ...current.googleBackupPrompt,
          subjectsAddedCount:
            current.googleBackupPrompt.subjectsAddedCount + 1,
        },
      }));
      queueSubjectWrite(next).catch(() => undefined);
      return id;
    },
    [],
  );

  const updateSubject = useCallback((subjectId: string, update: Partial<Subject>) => {
    const item = state.subjects.find((subject) => subject.id === subjectId);
    if (!item) return;
    const next = normalizeSubject({
      ...item,
      ...update,
      id: item.id,
      updatedAt: new Date().toISOString(),
    });
    setState((current) => ({
      ...current,
      subjects: current.subjects.map((item) =>
        item.id === subjectId ? next : item,
      ),
    }));
    queueSubjectWrite(next).catch(() => undefined);
  }, [state.subjects]);

  const deleteSubject = useCallback((subjectId: string) => {
    const deleted = state.subjects.find((subject) => subject.id === subjectId);
    setState((current) => {
      const subjects = current.subjects.filter((item) => item.id !== subjectId);
      return {
        ...current,
        subjects,
        selectedSubjectId:
          current.selectedSubjectId === subjectId
            ? (subjects[0]?.id ?? null)
            : current.selectedSubjectId,
      };
    });
    if (deleted) queueSubjectDelete(deleted).catch(() => undefined);
  }, [state.subjects]);

  const toggleFavorite = useCallback((subjectId: string) => {
    const item = state.subjects.find((subject) => subject.id === subjectId);
    if (!item) return;
    const next = { ...item, favorite: !item.favorite };
    setState((current) => ({
      ...current,
      subjects: current.subjects.map((item) =>
        item.id === subjectId ? next : item,
      ),
    }));
    queueSubjectWrite(next).catch(() => undefined);
  }, [state.subjects]);

  const setSelectedSubjectId = useCallback((subjectId: string | null) => {
    setState((current) => ({ ...current, selectedSubjectId: subjectId }));
  }, []);

  const updateSettings = useCallback((update: Partial<UserSettings>) => {
    const next = { ...state.settings, ...update };
    setState((current) => ({
      ...current,
      settings: next,
    }));
    queueUserSettingsWrite(next, state.profile).catch(() => undefined);
  }, [state.profile, state.settings]);

  const resetSettings = useCallback(() => {
    setState((current) => ({ ...current, settings: DEFAULT_SETTINGS }));
    queueUserSettingsWrite(DEFAULT_SETTINGS, state.profile).catch(() => undefined);
  }, [state.profile]);

  const updateProfile = useCallback((update: Partial<UserProfile>) => {
    setState((current) => ({
      ...current,
      profile: { ...current.profile, ...update },
    }));
  }, []);

  const markGoogleBackupPromptShown = useCallback(() => {
    setState((current) => {
      if (current.googleBackupPrompt.autoPromptShownAt) return current;
      return {
        ...current,
        googleBackupPrompt: {
          ...current.googleBackupPrompt,
          autoPromptShownAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const replaceFromCloud = useCallback((incoming: Partial<PersistedAppState>) => {
    setState((current) => ({
      ...current,
      ...incoming,
      subjects: (incoming.subjects ?? current.subjects).map(
        normalizeSubject,
      ),
      settings: { ...current.settings, ...incoming.settings },
      profile: { ...current.profile, ...incoming.profile },
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      hydrated,
      selectedSubject: state.subjects.find(
        (subjectItem) => subjectItem.id === state.selectedSubjectId,
      ),
      saveAttendanceRecord,
      removeAttendanceRecord,
      markAttendance,
      upsertNote,
      addSubject,
      updateSubject,
      deleteSubject,
      toggleFavorite,
      setSelectedSubjectId,
      updateSettings,
      resetSettings,
      updateProfile,
      markGoogleBackupPromptShown,
      replaceFromCloud,
    }),
    [
      addSubject,
      deleteSubject,
      hydrated,
      markAttendance,
      markGoogleBackupPromptShown,
      removeAttendanceRecord,
      replaceFromCloud,
      resetSettings,
      setSelectedSubjectId,
      saveAttendanceRecord,
      state,
      toggleFavorite,
      updateProfile,
      updateSettings,
      updateSubject,
      upsertNote,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
