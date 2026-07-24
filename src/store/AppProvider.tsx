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
  AttendanceStatus,
  PersistedAppState,
  Subject,
  UserProfile,
  UserSettings,
} from '../types';
import { statusContribution } from '../utils/attendance';

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
      setState((current) => ({
        ...current,
        selectedSubjectId: subjectId,
        subjects: current.subjects.map((item) => {
          if (item.id !== subjectId) return item;
          const previous = item.records[date];
          const oldContribution = statusContribution(previous?.status);
          const nextContribution = statusContribution(status);
          const now = new Date().toISOString();
          return {
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
            records: {
              ...item.records,
              [date]: {
                date,
                status,
                note: previous?.note,
                updatedAt: now,
              },
            },
            updatedAt: now,
          };
        }),
      }));
    },
    [],
  );

  const upsertNote = useCallback((subjectId: string, date: string, note: string) => {
    setState((current) => ({
      ...current,
      subjects: current.subjects.map((item) => {
        if (item.id !== subjectId) return item;
        const now = new Date().toISOString();
        const previous = item.records[date];
        return {
          ...item,
          records: {
            ...item.records,
            [date]: {
              date,
              status: previous?.status ?? 'no-class',
              note: note.trim() || undefined,
              updatedAt: now,
            },
          },
          updatedAt: now,
        };
      }),
    }));
  }, []);

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
      return id;
    },
    [],
  );

  const updateSubject = useCallback((subjectId: string, update: Partial<Subject>) => {
    setState((current) => ({
      ...current,
      subjects: current.subjects.map((item) =>
        item.id === subjectId
          ? { ...item, ...update, id: item.id, updatedAt: new Date().toISOString() }
          : item,
      ),
    }));
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
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
  }, []);

  const toggleFavorite = useCallback((subjectId: string) => {
    setState((current) => ({
      ...current,
      subjects: current.subjects.map((item) =>
        item.id === subjectId ? { ...item, favorite: !item.favorite } : item,
      ),
    }));
  }, []);

  const setSelectedSubjectId = useCallback((subjectId: string | null) => {
    setState((current) => ({ ...current, selectedSubjectId: subjectId }));
  }, []);

  const updateSettings = useCallback((update: Partial<UserSettings>) => {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, ...update },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setState((current) => ({ ...current, settings: DEFAULT_SETTINGS }));
  }, []);

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
