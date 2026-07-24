import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { NotificationPreferences } from '../types';

const REMINDER_ID_KEY = '@streak75/daily-reminder-id';
const CHANNEL_ID = 'attendance-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface ReminderScheduleResult {
  scheduled: boolean;
  reason?: 'disabled' | 'permission-denied' | 'unsupported';
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Attendance reminders',
    description: 'Daily class marking and low-attendance reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 180, 100, 180],
    lightColor: '#B6F20C',
    enableVibrate: true,
    showBadge: false,
  });
}

async function cancelPreviousReminder(): Promise<void> {
  const previousId = await AsyncStorage.getItem(REMINDER_ID_KEY);
  if (!previousId) return;
  await Notifications.cancelScheduledNotificationAsync(previousId).catch(
    () => undefined,
  );
  await AsyncStorage.removeItem(REMINDER_ID_KEY);
}

export async function scheduleDailyReminder(
  preferences: NotificationPreferences,
): Promise<ReminderScheduleResult> {
  if (Platform.OS === 'web') return { scheduled: false, reason: 'unsupported' };
  await cancelPreviousReminder();
  if (!preferences.dailyReminderEnabled) {
    return { scheduled: false, reason: 'disabled' };
  }
  if (!(await ensurePermission())) {
    return { scheduled: false, reason: 'permission-denied' };
  }

  await ensureAndroidChannel();
  const [hour = 7, minute = 30] = preferences.reminderTime.split(':').map(Number);
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Keep your Streak75 updated',
      body: 'Mark today’s classes while they’re fresh in your mind.',
      sound: 'default',
      color: '#B6F20C',
      data: { destination: 'home', kind: 'daily-attendance' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
  await AsyncStorage.setItem(REMINDER_ID_KEY, identifier);
  return { scheduled: true };
}

export async function sendLowAttendanceAlert(
  subjectName: string,
  percentage: number,
): Promise<void> {
  if (Platform.OS === 'web' || !(await ensurePermission())) return;
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${subjectName} needs attention`,
      body: `Attendance is now ${Math.round(percentage)}%. Open Bunk Meter to plan your recovery.`,
      sound: 'default',
      color: '#F4B81F',
      data: { destination: 'bunk-meter', kind: 'low-attendance' },
    },
    trigger: null,
  });
}
