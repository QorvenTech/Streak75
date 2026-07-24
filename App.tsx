import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/space-grotesk';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BrandLogo } from './src/components/BrandLogo';
import { colors, fonts } from './src/constants/theme';
import { AppProvider, useApp } from './src/store/AppProvider';

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={styles.splash} />;
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <FoundationScreen />
      </AppProvider>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

function FoundationScreen() {
  const { hydrated } = useApp();

  useEffect(() => {
    // The navigation milestone replaces this branded boot screen.
  }, []);

  return (
    <View style={styles.container}>
      <BrandLogo size={116} />
      <Text style={styles.wordmark}>
        Streak<Text style={styles.accent}>75</Text>
      </Text>
      <Text style={styles.tagline}>Hit 75. Stay Ahead.</Text>
      <Text style={styles.subline}>TRACK. ANALYZE. ACHIEVE.</Text>
      <View style={styles.bootPill}>
        <View style={[styles.dot, hydrated && styles.dotReady]} />
        <Text style={styles.bootText}>{hydrated ? 'Ready offline' : 'Loading your data'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  wordmark: {
    marginTop: 22,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 46,
    letterSpacing: -2,
  },
  accent: {
    color: colors.lime,
  },
  tagline: {
    marginTop: 3,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  subline: {
    marginTop: 8,
    color: colors.cyan,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    letterSpacing: 2.1,
  },
  bootPill: {
    marginTop: 32,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  dotReady: {
    backgroundColor: colors.success,
  },
  bootText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
});
