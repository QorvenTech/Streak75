import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import {
  AttendanceRecord,
  PersistedAppState,
  Subject,
  UserProfile,
  UserSettings,
} from '../types';

type AuthModule = typeof import('@react-native-firebase/auth');
type FirestoreModule = typeof import('@react-native-firebase/firestore');
type GoogleModule = typeof import('@react-native-google-signin/google-signin');

export interface CloudUser {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
}

let modulePromise:
  | Promise<{
      auth: AuthModule;
      firestore: FirestoreModule;
      google: GoogleModule;
    }>
  | undefined;
let googleConfigured = false;

export function isCloudConfigured(): boolean {
  return (
    Platform.OS !== 'web' &&
    Constants.executionEnvironment !== ExecutionEnvironment.StoreClient &&
    Constants.expoConfig?.extra?.firebaseConfigured === true
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

const currentUserId = async (): Promise<string | null> => {
  if (!isCloudConfigured()) return null;
  const { auth } = await getModules();
  return auth.getAuth().currentUser?.uid ?? null;
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
        listener(
          user
            ? {
                uid: user.uid,
                displayName: user.displayName ?? 'Student',
                email: user.email,
                photoURL: user.photoURL,
              }
            : null,
        );
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

export async function signInWithGoogle(): Promise<CloudUser> {
  const { auth, google } = await getModules();
  configureGoogle(google);
  await google.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await google.GoogleSignin.signIn();
  if (response.type !== 'success' || !response.data.idToken) {
    throw new Error('Google Sign-In was cancelled.');
  }
  const credential = auth.GoogleAuthProvider.credential(response.data.idToken);
  const result = await auth.signInWithCredential(auth.getAuth(), credential);
  return {
    uid: result.user.uid,
    displayName: result.user.displayName ?? 'Student',
    email: result.user.email,
    photoURL: result.user.photoURL,
  };
}

export async function signOutFromGoogle(): Promise<void> {
  const { auth, google } = await getModules();
  await Promise.allSettled([
    auth.signOut(auth.getAuth()),
    google.GoogleSignin.signOut(),
  ]);
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

  const settings: UserSettings | undefined = userData
    ? {
        targetPercentage:
          typeof userData.targetAttendance === 'number'
            ? userData.targetAttendance
            : 75,
        colorBands: Array.isArray(userData.colorBands)
          ? (userData.colorBands as UserSettings['colorBands'])
          : [],
        notifications:
          (userData.notificationPreferences as UserSettings['notifications']) ?? {
            dailyReminderEnabled: true,
            reminderTime: '07:30',
            lowAttendanceAlertEnabled: true,
          },
        applyBandsGlobally:
          typeof userData.applyBandsGlobally === 'boolean'
            ? userData.applyBandsGlobally
            : true,
      }
    : undefined;

  return {
    ...(subjects.length ? { subjects } : {}),
    ...(settings?.colorBands.length ? { settings } : {}),
    profile: {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      authMode: 'signed-in',
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
  if (!(error instanceof Error)) return fallback;
  if (/cancel/i.test(error.message)) return 'Google Sign-In was cancelled.';
  if (/not configured/i.test(error.message)) return error.message;
  if (/network|offline|connection/i.test(error.message)) {
    return 'You appear to be offline. Keep tracking locally and try again later.';
  }
  return error.message || fallback;
}
