# Firebase and Google Sign-In setup

Streak75 deliberately ships without real Firebase credentials. Local-only
attendance works until these steps are completed.

## 1. Create the Firebase apps

In one Firebase project, register:

- Android package: `com.qorventech.streak75`
- iOS bundle ID: `com.qorventech.streak75`

Download the mobile configuration files:

```text
firebase/android/google-services.json
firebase/ios/GoogleService-Info.plist
```

Both paths are ignored by Git. Fake shape-only examples live in `firebase/`.

## 2. Enable services

1. Enable Google under Firebase Authentication → Sign-in method.
2. Create a Firestore database.
3. Deploy the included owner-only rules:

```bash
npx firebase-tools login
npx firebase-tools use YOUR_PROJECT_ID
npx firebase-tools deploy --only firestore
```

## 3. Configure Google OAuth

Create or confirm:

- Android OAuth client IDs for every signing SHA-1 (local debug, EAS, and Play
  App Signing where applicable)
- iOS OAuth client for the bundle ID
- Web OAuth client ID

Copy `.env.example` to `.env` and set:

```dotenv
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=000000000000-real.apps.googleusercontent.com
```

For EAS, configure the same public environment value and provide the two Firebase
files as secret files. Point `GOOGLE_SERVICES_JSON` and
`GOOGLE_SERVICE_INFO_PLIST` at the injected file paths.

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

The app config includes Firebase/Google plugins only when both mobile service
files exist. This keeps the no-credentials local build bootable.

## 5. Verify

1. Open Profile and tap **Sign in with Google**.
2. Mark a class while online and confirm the subject plus dated record appear in
   Firestore.
3. Disable connectivity, mark another class, and confirm the UI updates.
4. Restore connectivity and confirm Cloud sync changes to **Up to date** and the
   queued record appears in Firestore.
5. Set a daily reminder a few minutes ahead and background/close the app to test
   OS delivery.

Useful diagnostics:

```bash
npx @react-native-google-signin/config-doctor
npx expo config --type public
```

Official references:

- https://docs.expo.dev/guides/using-firebase/
- https://docs.expo.dev/guides/google-authentication/
- https://rnfirebase.io/firestore/usage
- https://react-native-google-signin.github.io/docs/setting-up/expo
