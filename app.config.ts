import { ConfigContext, ExpoConfig } from 'expo/config';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const androidFirebaseFile =
  process.env.GOOGLE_SERVICES_JSON ?? './firebase/android/google-services.json';
const iosFirebaseFile =
  process.env.GOOGLE_SERVICE_INFO_PLIST ?? './firebase/ios/GoogleService-Info.plist';

const hasAndroidFirebaseFile = existsSync(resolve(androidFirebaseFile));
const hasIosFirebaseFile = existsSync(resolve(iosFirebaseFile));
const hasAnyFirebaseFile = hasAndroidFirebaseFile || hasIosFirebaseFile;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Streak75',
  slug: 'streak75',
  scheme: 'streak75',
  owner: process.env.EXPO_PUBLIC_EXPO_OWNER,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#020B18',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.qorventech.streak75',
    ...(hasIosFirebaseFile ? { googleServicesFile: iosFirebaseFile } : {}),
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
  },
  android: {
    package: 'com.qorventech.streak75',
    ...(hasAndroidFirebaseFile ? { googleServicesFile: androidFirebaseFile } : {}),
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#020B18',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-dev-client',
    [
      'expo-notifications',
      {
        icon: './assets/android-icon-monochrome.png',
        color: '#B6F20C',
        defaultChannel: 'attendance-reminders',
      },
    ],
    'expo-sharing',
    [
      'expo-file-system',
      {
        enableFileSharing: true,
        supportsOpeningDocumentsInPlace: true,
      },
    ],
    '@react-native-community/datetimepicker',
    [
      'expo-build-properties',
      {
        ios: { useFrameworks: 'static' },
        android: { minSdkVersion: 24 },
      },
    ],
    'expo-font',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#020B18',
        image: './assets/splash-icon.png',
        imageWidth: 180,
      },
    ],
    ...(hasAnyFirebaseFile
      ? [
          '@react-native-firebase/app',
          '@react-native-firebase/auth',
          '@react-native-google-signin/google-signin',
        ]
      : []),
  ],
  extra: {
    firebaseConfigured: hasAnyFirebaseFile,
    firebaseConfiguredPlatforms: {
      android: hasAndroidFirebaseFile,
      ios: hasIosFirebaseFile,
    },
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? '',
    },
  },
  experiments: {
    typedRoutes: false,
  },
});
