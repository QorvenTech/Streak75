import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Streak75',
  slug: 'streak75',
  scheme: 'streak75',
  owner: process.env.EXPO_PUBLIC_EXPO_OWNER ?? 'harshsharma10',
  version: '1.0.0',
  runtimeVersion: 'exposdk:54.0.0',
  updates: {
    url: 'https://u.expo.dev/05a2bc7c-94f4-4a8f-8528-f1ff41c23b8c',
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: '#F7F9FE',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.qorventech.streak75',
  },
  android: {
    package: 'com.qorventech.streak75',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#F7F9FE',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    [
      'expo-notifications',
      {
        icon: './assets/android-icon-monochrome.png',
        color: '#175CFF',
        defaultChannel: 'attendance-reminders',
      },
    ],
    [
      'expo-file-system',
      {
        enableFileSharing: true,
        supportsOpeningDocumentsInPlace: true,
      },
    ],
    'expo-font',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#F7F9FE',
        image: './assets/splash-icon.png',
        imageWidth: 180,
        dark: {
          backgroundColor: '#030B17',
          image: './assets/splash-icon-dark.png',
        },
      },
    ],
  ],
  extra: {
    firebaseConfigured: false,
    expoGoTestMode: true,
    eas: {
      projectId:
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
        '05a2bc7c-94f4-4a8f-8528-f1ff41c23b8c',
    },
  },
  experiments: {
    typedRoutes: false,
  },
});
