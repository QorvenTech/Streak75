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

import { createInitialState, DEFAULT_SETTINGS } from '../data/defaults';
import {
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
import { attendancePercentage, statusContribution } from '../utils/attendance';

const STORAGE_KEY = '@streak75/state/v1';

interface AppContextValue extends PersistedAppState {
  hydrated: boolean;
  selectedSubject: Subject | undefined;
  markAttendance: (subjectId: string, date: string, status: AttendanceStatus) => void;
  upsertNote: (subjectId: string, date: string, note: string) => void;
  addSubject: (input: Pick<Subject, 'name' | 'professor' | 'icon' | 'color'>) => string;
  updateSubject: (subjectId: string, update: Partial<Subject>) => void;
  deleteSubject: (subjectId: string) => void;
  toggleFavorite: (subjectId: string) => void;
  setSelectedSubjectId: (subjectId: string | null) => void;
  updateSettings: (update: Partial<UserSettings>) => void;
  resetSettings: () => void;
  updateProfile: (update: Partial<UserProfile>) => void;
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
        setState((current) => ({
          ...current,
          ...parsed,
          settings: { ...current.settings, ...parsed.settings },
          profile: { ...current.profile, ...parsed.profile },
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

  const markAttendance = useCallback(
    (subjectId: string, date: string, status: AttendanceStatus) => {
      const item = state.subjects.find((subject) => subject.id === subjectId);
      if (!item) return;
      const previous = item.records[date];
      const oldContribution = statusContribution(previous?.status);
      const nextContribution = statusContribution(status);
      const now = new Date().toISOString();
      const record = {
        date,
        status,
        note: previous?.note,
        updatedAt: now,
      };
      const nextSubject: Subject = {
        ...item,
        classesHeld: Math.max(
          0,
          item.classesHeld - oldContribution.held + nextContribution.held,
        ),
        classesAttended: Math.max(
          0,
          item.classesAttended -
            oldContribution.attended +
            nextContribution.attended,
        ),
        records: { ...item.records, [date]: record },
        updatedAt: now,
      };
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

  const upsertNote = useCallback((subjectId: string, date: string, note: string) => {
    const item = state.subjects.find((subject) => subject.id === subjectId);
    if (!item) return;
    const now = new Date().toISOString();
    const previous = item.records[date];
    const record = {
      date,
      status: previous?.status ?? ('no-class' as const),
      note: note.trim() || undefined,
      updatedAt: now,
    };
    const nextSubject = {
      ...item,
      records: { ...item.records, [date]: record },
      updatedAt: now,
    };
    setState((current) => ({
      ...current,
      subjects: current.subjects.map((subject) =>
        subject.id === subjectId ? nextSubject : subject,
      ),
    }));
    queueRecordWrite(nextSubject, record).catch(() => undefined);
  }, [state.subjects]);

  const addSubject = useCallback(
    (input: Pick<Subject, 'name' | 'professor' | 'icon' | 'color'>): string => {
      const id = Crypto.randomUUID();
      const now = new Date().toISOString();
      const next: Subject = {
        ...input,
        id,
        favorite: false,
        classesHeld: 0,
        classesAttended: 0,
        records: {},
        createdAt: now,
        updatedAt: now,
      };
      setState((current) => ({
        ...current,
        subjects: [...current.subjects, next],
        selectedSubjectId: id,
      }));
      queueSubjectWrite(next).catch(() => undefined);
      return id;
    },
    [],
  );

  const updateSubject = useCallback((subjectId: string, update: Partial<Subject>) => {
    const item = state.subjects.find((subject) => subject.id === subjectId);
    if (!item) return;
    const next = {
      ...item,
      ...update,
      id: item.id,
      updatedAt: new Date().toISOString(),
    };
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

  const replaceFromCloud = useCallback((incoming: Partial<PersistedAppState>) => {
    setState((current) => ({
      ...current,
      ...incoming,
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
      replaceFromCloud,
    }),
    [
      addSubject,
      deleteSubject,
      hydrated,
      markAttendance,
      replaceFromCloud,
      resetSettings,
      setSelectedSubjectId,
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
