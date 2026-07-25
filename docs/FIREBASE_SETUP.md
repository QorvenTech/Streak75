# Firebase Anonymous Auth and Google linking setup

Streak75 deliberately ships without real Firebase credentials. A configured
native build signs in anonymously on first launch; local fallback remains
available until these steps are completed.

## 1. Register the Firebase apps

In the `Streak75` Firebase project, register the platform you plan to build:

- Android package: `com.qorventech.streak75`
- iOS bundle ID: `com.qorventech.streak75`

Download the mobile configuration files:

```text
firebase/android/google-services.json
firebase/ios/GoogleService-Info.plist
```

Both paths are ignored by Git. Fake shape-only examples live in `firebase/`.
Android development only needs the Android file; add the iOS file before an iOS
build.

## 2. Enable Firebase services

1. In Firebase Authentication, open **Sign-in method** and enable **Anonymous**.
2. Enable **Google** on the same page.
3. Create a Firestore database.
4. Deploy the included owner-only rules:

```bash
npx firebase-tools login
npx firebase-tools use YOUR_PROJECT_ID
npx firebase-tools deploy --only firestore
```

The rules accept both anonymous and Google-linked users because both have a
Firebase Auth UID, while preventing access to another UID's documents.

## 3. Configure Google OAuth

Create or confirm:

- Android OAuth client IDs for every signing SHA-1: local debug, EAS, and Play
  App Signing where applicable
- iOS OAuth client for the bundle ID
- Web OAuth client ID

Copy `.env.example` to `.env` and set:

```dotenv
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=000000000000-real.apps.googleusercontent.com
```

For EAS, configure the same public environment value and provide the Firebase
file for each platform being built as a secret file. Point
`GOOGLE_SERVICES_JSON` and `GOOGLE_SERVICE_INFO_PLIST` at the injected paths.

## 4. Create a development build

React Native Firebase and native Google Sign-In cannot run inside Expo Go.

```bash
npm install
npx expo prebuild
npx expo run:android
```

Or use EAS:

```bash
npx eas-cli build --profile development --platform android
```

The app config detects Android and iOS Firebase files independently. This allows
an Android build with only `google-services.json`, while keeping a
no-credentials local fallback build bootable.

## 5. Verify the complete auth flow

1. Clear the development app's storage, launch it, and confirm Home opens without
   a login screen.
2. In Firebase Authentication, confirm an anonymous user was created.
3. Add a subject or mark attendance and confirm documents appear immediately
   under that anonymous UID in `users/{uid}`.
4. Open Profile, tap **Sign in with Google**, and confirm Firebase now shows
   Google on the same UID.
5. Confirm the existing Firestore subject and record paths did not change.
6. Disable connectivity, mark another class, and confirm the UI updates.
7. Restore connectivity and confirm Cloud sync changes to **Up to date** and the
   queued record appears in Firestore.
8. Add three subjects on a fresh anonymous session and confirm the Google backup
   modal appears once, can be dismissed, and does not reappear after restart.
9. For the conflict test, connect a Google account on device A. On a fresh
   anonymous session on device B, select the same Google account. Confirm the
   existing-account explanation appears and device A's cloud data becomes active
   without device B's temporary subjects being merged.
10. Set a daily reminder a few minutes ahead and background/close the app to
    verify OS delivery.

Useful diagnostics:

```bash
npx @react-native-google-signin/config-doctor
npx expo config --type public
```

Official references:

- https://rnfirebase.io/auth/usage
- https://firebase.google.com/docs/auth/web/account-linking
- https://rnfirebase.io/firestore/usage
- https://react-native-google-signin.github.io/docs/setting-up/expo
