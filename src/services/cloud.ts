import {
  AttendanceRecord,
  PersistedAppState,
  Subject,
  UserProfile,
  UserSettings,
} from '../types';

export interface CloudUser {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
}

export const EXPO_GO_CLOUD_MESSAGE =
  'Cloud backup is disabled in the Expo Go test build. Use the launch branch with a development or EAS build to test Firebase and Google Sign-In.';

export function isCloudConfigured(): boolean {
  return false;
}

export function subscribeToAuth(
  listener: (user: CloudUser | null) => void,
  _onError?: (error: Error) => void,
): () => void {
  listener(null);
  return () => undefined;
}

export async function signInWithGoogle(): Promise<CloudUser> {
  throw new Error(EXPO_GO_CLOUD_MESSAGE);
}

export async function signOutFromGoogle(): Promise<void> {
  return undefined;
}

export async function queueSubjectWrite(_subject: Subject): Promise<void> {
  return undefined;
}

export async function queueRecordWrite(
  _subject: Subject,
  _record: AttendanceRecord,
): Promise<void> {
  return undefined;
}

export async function queueRecordDelete(
  _subjectId: string,
  _date: string,
): Promise<void> {
  return undefined;
}

export async function queueSubjectDelete(_subject: Subject): Promise<void> {
  return undefined;
}

export async function queueUserSettingsWrite(
  _settings: UserSettings,
  _profile?: UserProfile,
): Promise<void> {
  return undefined;
}

export async function syncAllToCloud(
  _uid: string,
  _state: Pick<PersistedAppState, 'subjects' | 'settings' | 'profile'>,
): Promise<void> {
  throw new Error(EXPO_GO_CLOUD_MESSAGE);
}

export async function pullFromCloud(
  _user: CloudUser,
): Promise<Partial<PersistedAppState>> {
  return {};
}

export async function waitForCloudSync(_timeoutMs = 12_000): Promise<void> {
  throw new Error(EXPO_GO_CLOUD_MESSAGE);
}

export function readableCloudError(error: unknown): string {
  return error instanceof Error ? error.message : EXPO_GO_CLOUD_MESSAGE;
}
