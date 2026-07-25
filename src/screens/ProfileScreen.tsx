import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SettingsRow } from '../components/SettingsRow';
import { colors, fonts, radii } from '../constants/theme';
import { useGoogleAccountLink } from '../hooks/useGoogleAccountLink';
import { RootStackParamList, TabParamList } from '../navigation/types';
import {
  readableCloudError,
  syncAllToCloud,
  waitForCloudSync,
} from '../services/cloud';
import { useApp } from '../store/AppProvider';

type ProfileNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigation>();
  const { profile, settings, subjects, updateProfile } = useApp();
  const { googleLinkBusy, linkGoogleAccount } = useGoogleAccountLink();
  const [syncBusy, setSyncBusy] = useState(false);

  const handleGoogleAccount = async () => {
    await linkGoogleAccount();
  };

  const handleManualSync = async () => {
    if (!profile.uid || profile.authMode === 'local') {
      Alert.alert(
        'Cloud account is starting',
        'Your anonymous Firebase account has not initialized yet. Check your connection and try again.',
      );
      return;
    }
    setSyncBusy(true);
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
      setSyncBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your attendance command centre.</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile.displayName || 'S').slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.email}>
            {profile.email ??
              (profile.authMode === 'anonymous'
                ? 'Anonymous cloud profile'
                : 'Local fallback profile')}
          </Text>
          <View style={styles.modePill}>
            <View
              style={[
                styles.modeDot,
                {
                  backgroundColor:
                    profile.authMode === 'signed-in'
                      ? colors.success
                      : profile.authMode === 'anonymous'
                        ? colors.cyan
                        : colors.warning,
                },
              ]}
            />
            <Text style={styles.modeText}>
              {profile.authMode === 'signed-in'
                ? 'Google connected'
                : profile.authMode === 'anonymous'
                  ? 'Anonymous cloud backup'
                  : 'Cloud temporarily unavailable'}
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
        <SettingsRow
          icon="weather-night"
          iconColor={colors.purple}
          title="Appearance"
          subtitle="Dark mode is always on — focused and battery friendly."
          right={<Text style={styles.darkOnly}>Dark only</Text>}
        />
      </View>

      <Text style={styles.sectionTitle}>Backup & sync</Text>
      <View style={styles.rows}>
        <SettingsRow
          icon={profile.authMode === 'signed-in' ? 'google' : 'google'}
          iconColor={colors.blue}
          title={profile.authMode === 'signed-in' ? 'Signed in with Google' : 'Sign in with Google'}
          subtitle={
            profile.authMode === 'signed-in'
              ? profile.email ?? 'Cloud backup enabled'
              : 'Connect for recovery when you switch phones or reinstall.'
          }
          onPress={handleGoogleAccount}
          right={
            googleLinkBusy ? (
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
              : profile.authMode === 'anonymous'
                ? 'Anonymous cloud backup is initializing.'
                : 'Waiting for Firebase configuration.'
          }
          onPress={handleManualSync}
          right={
            syncBusy ? (
              <ActivityIndicator color={colors.cyan} size="small" />
            ) : undefined
          }
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
              'Every installation starts with a private anonymous Firebase UID. Firestore rules allow only that UID to access its data. Linking Google keeps the same UID unless an older Google-linked account already exists.',
            )
          }
        />
      </View>

      <View style={styles.brandFooter}>
        <View style={styles.brandIcon}>
          <MaterialCommunityIcons name="shield-check-outline" color={colors.lime} size={23} />
        </View>
        <View>
          <Text style={styles.brandName}>Streak75 · v1.0.0</Text>
          <Text style={styles.brandTagline}>Track. Analyze. Achieve.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  darkOnly: {
    color: colors.purple,
    fontFamily: fonts.semiBold,
    fontSize: 10,
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
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.lime}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  brandTagline: {
    color: colors.cyan,
    fontFamily: fonts.medium,
    fontSize: 8,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
});
