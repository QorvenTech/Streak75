import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import { DEFAULT_SETTINGS } from '../data/defaults';
import {
  AttendanceRecord,
  PersistedAppState,
  Subject,
  UserProfile,
  UserSettings,
} from '../types';
import {
  firebaseAuthErrorCode,
  isCredentialAlreadyInUseError,
} from '../utils/firebaseAuthErrors';

type AuthModule = typeof import('@react-native-firebase/auth');
type FirestoreModule = typeof import('@react-native-firebase/firestore');
type GoogleModule = typeof import('@react-native-google-signin/google-signin');

export interface CloudUser {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export interface GoogleLinkResult {
  user: CloudUser;
  outcome: 'linked' | 'already-linked' | 'existing-account';
  previousAnonymousUid?: string;
}

export interface ExistingAccountSwitch {
  sourceAnonymousUid: string;
  requestedAt: string;
}

const PENDING_ACCOUNT_SWITCH_KEY = '@streak75/pending-google-account-switch/v1';

let modulePromise:
  | Promise<{
      auth: AuthModule;
      firestore: FirestoreModule;
      google: GoogleModule;
    }>
  | undefined;
let googleConfigured = false;
let anonymousAuthPromise: Promise<CloudUser> | undefined;
let pendingAccountSwitch: ExistingAccountSwitch | null = null;

export function isCloudConfigured(): boolean {
  const configuredPlatforms = Constants.expoConfig?.extra
    ?.firebaseConfiguredPlatforms as
    | { android?: boolean; ios?: boolean }
    | undefined;
  const configuredForPlatform =
    Platform.OS === 'android'
      ? configuredPlatforms?.android
      : Platform.OS === 'ios'
        ? configuredPlatforms?.ios
        : false;
  return (
    Platform.OS !== 'web' &&
    Constants.executionEnvironment !== ExecutionEnvironment.StoreClient &&
    (configuredForPlatform ??
      Constants.expoConfig?.extra?.firebaseConfigured === true)
  );
}

async function getModules() {
  if (!isCloudConfigured()) {
    throw new Error(
      'Cloud backup is not configured. Add Firebase service files and create a development build.',
    );
  }
  modulePromise ??= Promise.all([
    import('@react-native-firebase/auth'),
    import('@react-native-firebase/firestore'),
    import('@react-native-google-signin/google-signin'),
  ]).then(([auth, firestore, google]) => ({ auth, firestore, google }));
  return modulePromise;
}

function configureGoogle(google: GoogleModule): void {
  if (googleConfigured) return;
  const webClientId = Constants.expoConfig?.extra?.googleWebClientId as
    | string
    | undefined;
  google.GoogleSignin.configure({
    ...(webClientId ? { webClientId } : {}),
    offlineAccess: false,
  });
  googleConfigured = true;
}

const clean = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

const subjectDocument = (subject: Subject) => {
  const { records: _records, ...document } = subject;
  return clean(document);
};

const toCloudUser = (user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}): CloudUser => ({
  uid: user.uid,
  displayName: user.displayName ?? 'Student',
  email: user.email,
  photoURL: user.photoURL,
  isAnonymous: user.isAnonymous,
});

export async function ensureAnonymousSession(): Promise<CloudUser> {
  const { auth } = await getModules();
  const firebaseAuth = auth.getAuth();
  if (firebaseAuth.currentUser) return toCloudUser(firebaseAuth.currentUser);
  anonymousAuthPromise ??= auth
    .signInAnonymously(firebaseAuth)
    .then((result) => toCloudUser(result.user));
  try {
    return await anonymousAuthPromise;
  } finally {
    anonymousAuthPromise = undefined;
  }
}

const currentUserId = async (): Promise<string | null> => {
  if (!isCloudConfigured()) return null;
  return (await ensureAnonymousSession()).uid;
};

export function subscribeToAuth(
  listener: (user: CloudUser | null) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isCloudConfigured()) {
    listener(null);
    return () => undefined;
  }
  let disposed = false;
  let unsubscribe: (() => void) | undefined;
  getModules()
    .then(({ auth }) => {
      if (disposed) return;
      unsubscribe = auth.onAuthStateChanged(auth.getAuth(), (user) => {
        listener(user ? toCloudUser(user) : null);
      });
    })
    .catch((error: unknown) => {
      onError?.(error instanceof Error ? error : new Error('Firebase Auth failed.'));
    });
  return () => {
    disposed = true;
    unsubscribe?.();
  };
}

async function rememberPendingAccountSwitch(
  sourceAnonymousUid: string,
): Promise<void> {
  pendingAccountSwitch = {
    sourceAnonymousUid,
    requestedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(
    PENDING_ACCOUNT_SWITCH_KEY,
    JSON.stringify(pendingAccountSwitch),
  );
}

async function clearPendingAccountSwitch(): Promise<void> {
  pendingAccountSwitch = null;
  await AsyncStorage.removeItem(PENDING_ACCOUNT_SWITCH_KEY);
}

export async function consumeExistingAccountSwitch(
  targetUid: string,
): Promise<ExistingAccountSwitch | null> {
  let switchState = pendingAccountSwitch;
  if (!switchState) {
    const stored = await AsyncStorage.getItem(PENDING_ACCOUNT_SWITCH_KEY);
    if (stored) {
      try {
        switchState = JSON.parse(stored) as ExistingAccountSwitch;
      } catch {
        switchState = null;
      }
    }
  }
  await clearPendingAccountSwitch();
  return switchState?.sourceAnonymousUid !== targetUid ? switchState : null;
}

export async function linkAnonymousUserWithGoogle(): Promise<GoogleLinkResult> {
  const { auth, google } = await getModules();
  configureGoogle(google);
  const firebaseAuth = auth.getAuth();
  const currentUser = firebaseAuth.currentUser ?? (
    await auth.signInAnonymously(firebaseAuth)
  ).user;
  if (!currentUser.isAnonymous) {
    return {
      user: toCloudUser(currentUser),
      outcome: 'already-linked',
    };
  }
  await google.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await google.GoogleSignin.signIn();
  if (response.type !== 'success' || !response.data.idToken) {
    throw new Error('Google Sign-In was cancelled.');
  }
  const credential = auth.GoogleAuthProvider.credential(response.data.idToken);
  try {
    const result = await auth.linkWithCredential(currentUser, credential);
    return {
      user: toCloudUser(result.user),
      outcome: 'linked',
      previousAnonymousUid: currentUser.uid,
    };
  } catch (error) {
    if (!isCredentialAlreadyInUseError(error)) throw error;
    await rememberPendingAccountSwitch(currentUser.uid);
    try {
      const result = await auth.signInWithCredential(firebaseAuth, credential);
      return {
        user: toCloudUser(result.user),
        outcome: 'existing-account',
        previousAnonymousUid: currentUser.uid,
      };
    } catch (signInError) {
      await clearPendingAccountSwitch();
      throw signInError;
    }
  }
}

export async function queueSubjectWrite(subject: Subject): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  const { firestore } = await getModules();
  const database = firestore.getFirestore();
  await firestore.setDoc(
    firestore.doc(database, 'users', uid, 'subjects', subject.id),
    subjectDocument(subject),
    { merge: true },
  );
}

export async function queueRecordWrite(
  subject: Subject,
  record: AttendanceRecord,
): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  const { firestore } = await getModules();
  const database = firestore.getFirestore();
  await Promise.all([
    firestore.setDoc(
      firestore.doc(database, 'users', uid, 'subjects', subject.id),
      subjectDocument(subject),
      { merge: true },
    ),
    firestore.setDoc(
      firestore.doc(
        database,
        'users',
        uid,
        'subjects',
        subject.id,
        'records',
        record.date,
      ),
      clean(record),
      { merge: true },
    ),
  ]);
}

export async function queueRecordDelete(
  subjectId: string,
  date: string,
): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  const { firestore } = await getModules();
  const database = firestore.getFirestore();
  await firestore.deleteDoc(
    firestore.doc(
      database,
      'users',
      uid,
      'subjects',
      subjectId,
      'records',
      date,
    ),
  );
}

export async function queueSubjectDelete(subject: Subject): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  const { firestore } = await getModules();
  const database = firestore.getFirestore();
  const deletes = Object.keys(subject.records).map((date) =>
    firestore.deleteDoc(
      firestore.doc(
        database,
        'users',
        uid,
        'subjects',
        subject.id,
        'records',
        date,
      ),
    ),
  );
  deletes.push(
    firestore.deleteDoc(
      firestore.doc(database, 'users', uid, 'subjects', subject.id),
    ),
  );
  await Promise.all(deletes);
}

export async function queueUserSettingsWrite(
  settings: UserSettings,
  profile?: UserProfile,
): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  const { firestore } = await getModules();
  const database = firestore.getFirestore();
  await firestore.setDoc(
    firestore.doc(database, 'users', uid),
    clean({
      profile: profile
        ? {
            displayName: profile.displayName,
            email: profile.email,
            photoURL: profile.photoURL,
          }
        : undefined,
      targetAttendance: settings.targetPercentage,
      colorBands: settings.colorBands,
      notificationPreferences: settings.notifications,
      cardAppearance: settings.cardAppearance,
      applyBandsGlobally: settings.applyBandsGlobally,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true },
  );
}

export async function syncAllToCloud(
  uid: string,
  state: Pick<PersistedAppState, 'subjects' | 'settings' | 'profile'>,
): Promise<void> {
  const { firestore } = await getModules();
  const database = firestore.getFirestore();
  const writes: Promise<void>[] = [
    firestore.setDoc(
      firestore.doc(database, 'users', uid),
      clean({
        profile: {
          displayName: state.profile.displayName,
          email: state.profile.email,
          photoURL: state.profile.photoURL,
        },
        targetAttendance: state.settings.targetPercentage,
        colorBands: state.settings.colorBands,
        notificationPreferences: state.settings.notifications,
        cardAppearance: state.settings.cardAppearance,
        applyBandsGlobally: state.settings.applyBandsGlobally,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true },
    ),
  ];
  state.subjects.forEach((subject) => {
    writes.push(
      firestore.setDoc(
        firestore.doc(database, 'users', uid, 'subjects', subject.id),
        subjectDocument(subject),
        { merge: true },
      ),
    );
    Object.values(subject.records).forEach((record) => {
      writes.push(
        firestore.setDoc(
          firestore.doc(
            database,
            'users',
            uid,
            'subjects',
            subject.id,
            'records',
            record.date,
          ),
          clean(record),
          { merge: true },
        ),
      );
    });
  });
  await Promise.all(writes);
}

export async function pullFromCloud(
  user: CloudUser,
  options: { includeEmpty?: boolean } = {},
): Promise<Partial<PersistedAppState>> {
  const { firestore } = await getModules();
  const database = firestore.getFirestore();
  const userRef = firestore.doc(database, 'users', user.uid);
  const [userSnapshot, subjectsSnapshot] = await Promise.all([
    firestore.getDoc(userRef),
    firestore.getDocs(firestore.collection(userRef, 'subjects')),
  ]);

  const userData = userSnapshot.exists()
    ? (userSnapshot.data() as Record<string, unknown>)
    : undefined;
  const subjects: Subject[] = await Promise.all(
    subjectsSnapshot.docs.map(async (subjectSnapshot) => {
      const recordSnapshots = await firestore.getDocs(
        firestore.collection(subjectSnapshot.ref, 'records'),
      );
      const records = Object.fromEntries(
        recordSnapshots.docs.map((recordSnapshot) => [
          recordSnapshot.id,
          recordSnapshot.data() as AttendanceRecord,
        ]),
      );
      return {
        ...(subjectSnapshot.data() as Omit<Subject, 'records'>),
        id: subjectSnapshot.id,
        records,
      };
    }),
  );

  const hasSettingsData =
    userData &&
    (typeof userData.targetAttendance === 'number' ||
      Array.isArray(userData.colorBands) ||
      typeof userData.notificationPreferences === 'object' ||
      typeof userData.cardAppearance === 'object' ||
      typeof userData.applyBandsGlobally === 'boolean');
  const settings: UserSettings | undefined = hasSettingsData
    ? {
        targetPercentage:
          typeof userData.targetAttendance === 'number'
            ? userData.targetAttendance
            : DEFAULT_SETTINGS.targetPercentage,
        colorBands: Array.isArray(userData.colorBands)
          ? (userData.colorBands as UserSettings['colorBands'])
          : DEFAULT_SETTINGS.colorBands,
        notifications:
          (userData.notificationPreferences as UserSettings['notifications']) ??
          DEFAULT_SETTINGS.notifications,
        cardAppearance:
          (userData.cardAppearance as UserSettings['cardAppearance']) ??
          DEFAULT_SETTINGS.cardAppearance,
        applyBandsGlobally:
          typeof userData.applyBandsGlobally === 'boolean'
            ? userData.applyBandsGlobally
            : DEFAULT_SETTINGS.applyBandsGlobally,
      }
    : options.includeEmpty
      ? clean(DEFAULT_SETTINGS)
      : undefined;

  return {
    ...(subjects.length || options.includeEmpty ? { subjects } : {}),
    ...(settings ? { settings } : {}),
    profile: {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      authMode: user.isAnonymous ? 'anonymous' : 'signed-in',
      syncStatus: 'up-to-date',
      lastSyncedAt: new Date().toISOString(),
    },
  };
}

export async function waitForCloudSync(timeoutMs = 12_000): Promise<void> {
  const { firestore } = await getModules();
  const pending = firestore.waitForPendingWrites(firestore.getFirestore());
  await Promise.race([
    pending,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Sync is waiting for an internet connection.')), timeoutMs);
    }),
  ]);
}

export function readableCloudError(error: unknown): string {
  const fallback = 'Google backup could not be completed. Your local data is unchanged.';
  if (firebaseAuthErrorCode(error) === 'auth/operation-not-allowed') {
    return 'Enable Anonymous and Google sign-in providers in Firebase Authentication, then try again.';
  }
  if (!(error instanceof Error)) return fallback;
  if (/cancel/i.test(error.message)) return 'Google Sign-In was cancelled.';
  if (/not configured/i.test(error.message)) return error.message;
  if (/network|offline|connection/i.test(error.message)) {
    return 'You appear to be offline. Keep tracking locally and try again later.';
  }
  return error.message || fallback;
}
