import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Card } from '../components/Card';
import { BrandLogo } from '../components/BrandLogo';
import { Screen } from '../components/Screen';
import { SettingsRow } from '../components/SettingsRow';
import { fonts, radii, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';
import { RootStackParamList, TabParamList } from '../navigation/types';
import {
  EXPO_GO_CLOUD_MESSAGE,
  isCloudConfigured,
  readableCloudError,
  signInWithGoogle,
  signOutFromGoogle,
  syncAllToCloud,
  waitForCloudSync,
} from '../services/cloud';
import { useApp } from '../store/AppProvider';
import { useAppTheme } from '../theme/ThemeProvider';

type ProfileNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ProfileScreen() {
  const { colors, styles } = useThemedStyles(createStyles);
  const navigation = useNavigation<ProfileNavigation>();
  const { profile, settings, subjects, updateProfile } = useApp();
  const { mode: themeMode, setMode: setThemeMode } = useAppTheme();
  const [cloudBusy, setCloudBusy] = useState(false);

  const handleGoogleAccount = async () => {
    if (!isCloudConfigured()) {
      Alert.alert(
        'Expo Go test mode',
        EXPO_GO_CLOUD_MESSAGE,
      );
      return;
    }
    setCloudBusy(true);
    try {
      if (profile.authMode === 'signed-in') {
        await signOutFromGoogle();
        updateProfile({
          uid: null,
          email: null,
          photoURL: null,
          authMode: 'local',
          syncStatus: 'local-only',
          lastSyncedAt: null,
        });
      } else {
        const user = await signInWithGoogle();
        updateProfile({
          ...user,
          authMode: 'signed-in',
          syncStatus: 'syncing',
        });
      }
    } catch (error) {
      Alert.alert('Google backup', readableCloudError(error));
    } finally {
      setCloudBusy(false);
    }
  };

  const handleManualSync = async () => {
    if (!profile.uid || profile.authMode !== 'signed-in') {
      Alert.alert(
        'Sign in for backup',
        'You can keep tracking locally. Connect Google only when you want cloud backup.',
      );
      return;
    }
    setCloudBusy(true);
    updateProfile({ syncStatus: 'syncing' });
    try {
      await syncAllToCloud(profile.uid, { profile, settings, subjects });
      await waitForCloudSync();
      updateProfile({
        syncStatus: 'up-to-date',
        lastSyncedAt: new Date().toISOString(),
      });
      Alert.alert('Cloud sync complete', 'Your attendance backup is up to date.');
    } catch (error) {
      updateProfile({ syncStatus: 'offline' });
      Alert.alert('Cloud sync', readableCloudError(error));
    } finally {
      setCloudBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Account, backup and app preferences.</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile.displayName || 'S').slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.email}>{profile.email ?? 'Local-only student profile'}</Text>
          <View style={styles.modePill}>
            <View
              style={[
                styles.modeDot,
                {
                  backgroundColor:
                    profile.authMode === 'signed-in' ? colors.success : colors.warning,
                },
              ]}
            />
            <Text style={styles.modeText}>
              {profile.authMode === 'signed-in' ? 'Google connected' : 'Backup not connected'}
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{subjects.length}</Text>
          <Text style={styles.statLabel}>Subjects</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.lime }]}>
            {settings.targetPercentage}%
          </Text>
          <Text style={styles.statLabel}>Target</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.cyan }]}>
            {settings.notifications.reminderTime}
          </Text>
          <Text style={styles.statLabel}>Reminder</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Personalize</Text>
      <View style={styles.rows}>
        <SettingsRow
          icon="palette-outline"
          iconColor={colors.lime}
          title="Attendance colors & target"
          subtitle="Customize labels, thresholds, reminders, and reports."
          onPress={() => navigation.navigate('ColorCustomization')}
        />
        <Card style={styles.appearanceCard}>
          <View style={styles.appearanceHeading}>
            <View style={styles.appearanceIcon}>
              <MaterialCommunityIcons
                name="theme-light-dark"
                color={colors.purple}
                size={21}
              />
            </View>
            <View style={styles.appearanceCopy}>
              <Text style={styles.appearanceTitle}>Appearance</Text>
              <Text style={styles.appearanceSubtitle}>
                Choose a theme or follow your phone.
              </Text>
            </View>
          </View>
          <View style={styles.themeSelector}>
            {(['light', 'dark', 'system'] as const).map((mode) => {
              const active = themeMode === mode;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[
                    styles.themeOption,
                    active && styles.themeOptionActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      mode === 'light'
                        ? 'white-balance-sunny'
                        : mode === 'dark'
                          ? 'weather-night'
                          : 'cellphone-cog'
                    }
                    color={active ? colors.white : colors.muted}
                    size={15}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      active && styles.themeOptionTextActive,
                    ]}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Backup & sync</Text>
      <View style={styles.rows}>
        <SettingsRow
          icon={profile.authMode === 'signed-in' ? 'google' : 'google'}
          iconColor={colors.blue}
          title={
            profile.authMode === 'signed-in'
              ? 'Signed in with Google'
              : 'Google Sign-In unavailable in Expo Go'
          }
          subtitle={
            profile.authMode === 'signed-in'
              ? profile.email ?? 'Cloud backup enabled'
              : 'Use the launch branch and a development build for cloud backup.'
          }
          onPress={handleGoogleAccount}
          right={
            cloudBusy ? (
              <ActivityIndicator color={colors.cyan} size="small" />
            ) : undefined
          }
        />
        <SettingsRow
          icon="cloud-sync-outline"
          title="Sync now"
          subtitle={
            profile.lastSyncedAt
              ? `Last synced ${profile.lastSyncedAt}`
              : 'Your local records are safe on this device.'
          }
          onPress={handleManualSync}
        />
      </View>

      <Text style={styles.sectionTitle}>Data & reports</Text>
      <View style={styles.rows}>
        <SettingsRow
          icon="file-export-outline"
          iconColor={colors.success}
          title="Export attendance"
          subtitle="Download all subjects as PDF or Excel."
          onPress={() => navigation.navigate('ColorCustomization')}
        />
        <SettingsRow
          icon="shield-lock-outline"
          iconColor={colors.cyan}
          title="Privacy"
          subtitle="Your cloud data is protected by per-user Firestore rules."
          onPress={() =>
            Alert.alert(
              'Privacy by design',
              'Local records stay on your device. Cloud records are readable only by your signed-in Firebase account.',
            )
          }
        />
      </View>

      <View style={styles.brandFooter}>
        <BrandLogo size={42} />
        <View>
          <Text style={styles.brandName}>Streak75 · v1.0.0</Text>
          <Text style={styles.brandTagline}>
            Stay on track,{' '}
            <Text style={styles.brandTaglineAccent}>stress less.</Text>
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  header: {
    minHeight: 76,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 23,
  },
  subtitle: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  profileCard: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  avatar: {
    width: 61,
    height: 61,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: colors.lime,
    backgroundColor: `${colors.lime}16`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.lime,
    fontFamily: fonts.bold,
    fontSize: 25,
  },
  profileCopy: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  email: {
    marginTop: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  modePill: {
    alignSelf: 'flex-start',
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modeText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 8,
  },
  stats: {
    marginVertical: 10,
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    minHeight: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 19,
  },
  statLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    marginTop: 9,
    marginBottom: 7,
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  rows: {
    gap: 7,
  },
  appearanceCard: {
    padding: 12,
    gap: 11,
  },
  appearanceHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  appearanceIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purpleSoft,
  },
  appearanceCopy: {
    flex: 1,
  },
  appearanceTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
  },
  appearanceSubtitle: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  themeSelector: {
    minHeight: 38,
    padding: 3,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    gap: 4,
  },
  themeOption: {
    flex: 1,
    minHeight: 32,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  themeOptionActive: {
    backgroundColor: colors.blue,
  },
  themeOptionText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 9,
  },
  themeOptionTextActive: {
    color: colors.white,
  },
  brandFooter: {
    marginTop: 20,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  brandName: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  brandTagline: {
    color: colors.blue,
    fontFamily: fonts.medium,
    fontSize: 8,
  },
  brandTaglineAccent: {
    color: colors.success,
  },
});
