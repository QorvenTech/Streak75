import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/space-grotesk';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GoogleBackupPromptModal } from './src/components/GoogleBackupPromptModal';
import { AppNavigator } from './src/navigation/AppNavigator';
import { CloudSyncBridge } from './src/services/CloudSyncBridge';
import { AppProvider } from './src/store/AppProvider';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeProvider';

function ThemedApp() {
  const { hydrated, theme } = useAppTheme();

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  return (
    <>
      <AppProvider>
        <CloudSyncBridge />
        <AppNavigator />
        <GoogleBackupPromptModal />
      </AppProvider>
      <StatusBar style={theme.colors.statusBar === 'dark' ? 'dark' : 'light'} />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#F7F9FE' }} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
