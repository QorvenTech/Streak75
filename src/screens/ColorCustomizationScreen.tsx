import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { Screen } from '../components/Screen';
import { SettingsRow } from '../components/SettingsRow';
import { SubjectCard } from '../components/SubjectCard';
import { colors, fonts, radii } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import {
  exportAllExcel,
  exportAllPdf,
} from '../services/exports';
import { scheduleDailyReminder } from '../services/notifications';
import { useApp } from '../store/AppProvider';
import { ColorBand } from '../types';
import { getColorBand, roundedAttendance } from '../utils/attendance';

type Props = NativeStackScreenProps<RootStackParamList, 'ColorCustomization'>;

const palette = [
  '#65D83A',
  '#B6F20C',
  '#35C5F0',
  '#4EA9F5',
  '#A86AF5',
  '#F4B81F',
  '#FF7A1A',
  '#F04444',
];

const percentageColorOptions = [
  { value: 'white', label: 'White' },
  { value: 'band', label: 'Status color' },
] as const;

const subjectNameColorOptions = [
  { value: 'white', label: 'White' },
  { value: 'subject', label: 'Subject color' },
  { value: 'band', label: 'Status color' },
] as const;

const dateFromTime = (time: string) => {
  const [hours = 7, minutes = 30] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const timeFromDate = (date: Date) =>
  `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;

export function ColorCustomizationScreen({ navigation }: Props) {
  const { settings, subjects, profile, updateSettings, resetSettings } = useApp();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [exporting, setExporting] = useState(false);
  const bands = useMemo(
    () => [...settings.colorBands].sort((a, b) => b.minimum - a.minimum),
    [settings.colorBands],
  );
  const preview = subjects[0];
  const previewPercentage = preview
    ? roundedAttendance(preview.classesAttended, preview.classesHeld)
    : 86;

  const updateBand = (id: string, update: Partial<ColorBand>) => {
    updateSettings({
      colorBands: settings.colorBands.map((band) =>
        band.id === id ? { ...band, ...update } : band,
      ),
    });
  };

  const updateThreshold = (band: ColorBand, index: number, value: number) => {
    const higher = bands[index - 1];
    const lower = bands[index + 1];
    const min = lower ? lower.minimum + 1 : 0;
    const max = higher ? higher.minimum - 1 : 100;
    updateBand(band.id, {
      minimum: Math.max(min, Math.min(max, Math.round(value))),
    });
  };

  const rangeText = (band: ColorBand, index: number) => {
    const higher = bands[index - 1];
    if (index === 0) return `${band.minimum}% and above`;
    if (band.minimum === 0) return `Below ${higher?.minimum ?? 1}%`;
    return `${band.minimum}% – ${(higher?.minimum ?? 100) - 1}%`;
  };

  const updateNotifications = (
    update: Partial<typeof settings.notifications>,
  ) => {
    const next = { ...settings.notifications, ...update };
    updateSettings({
      notifications: next,
    });
    if ('dailyReminderEnabled' in update || 'reminderTime' in update) {
      scheduleDailyReminder(next)
        .then((result) => {
          if (result.reason === 'permission-denied') {
            Alert.alert(
              'Notifications are disabled',
              'Enable notifications for Streak75 in device settings to receive the daily reminder.',
            );
          }
        })
        .catch(() =>
          Alert.alert(
            'Reminder not scheduled',
            'Your preference was saved, but the device could not schedule the reminder.',
          ),
        );
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'set' && date) {
      updateNotifications({ reminderTime: timeFromDate(date) });
    }
  };

  const runExport = async (format: 'pdf' | 'excel') => {
    setExporting(true);
    try {
      if (format === 'pdf') {
        await exportAllPdf(subjects, settings);
      } else {
        await exportAllExcel(subjects, settings);
      }
    } catch (error) {
      Alert.alert(
        'Export failed',
        error instanceof Error ? error.message : 'The report could not be created.',
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <Screen>
      <PageHeader
        title="Color customization"
        subtitle="Customize your rules, your way."
        onBack={navigation.goBack}
        right={
          <Pressable onPress={resetSettings} hitSlop={10}>
            <Text style={styles.reset}>Reset</Text>
          </Pressable>
        }
      />

      <Text style={styles.sectionTitle}>Target attendance</Text>
      <Card style={styles.targetCard}>
        <View style={styles.targetTop}>
          <View>
            <Text style={styles.targetLabel}>Your minimum target</Text>
            <Text style={styles.targetHint}>Used by Bunk Meter and risk alerts.</Text>
          </View>
          <View style={styles.targetValue}>
            <Text style={styles.targetNumber}>{settings.targetPercentage}</Text>
            <Text style={styles.targetSymbol}>%</Text>
          </View>
        </View>
        <Slider
          minimumValue={50}
          maximumValue={95}
          step={1}
          value={settings.targetPercentage}
          minimumTrackTintColor={colors.lime}
          maximumTrackTintColor={colors.surfaceSoft}
          thumbTintColor={colors.lime}
          onValueChange={(value) =>
            updateSettings({ targetPercentage: Math.round(value) })
          }
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>50%</Text>
          <Text style={styles.sliderLabel}>95%</Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Attendance status rules</Text>
      <Text style={styles.sectionHint}>
        Rename labels, move thresholds, and choose a color for every band.
      </Text>
      <View style={styles.bandList}>
        {bands.map((band, index) => {
          const higher = bands[index - 1];
          const lower = bands[index + 1];
          const min = lower ? lower.minimum + 1 : 0;
          const max = higher ? higher.minimum - 1 : 100;
          return (
            <Card key={band.id} style={styles.bandCard}>
              <View style={styles.bandTop}>
                <View style={[styles.bandDot, { backgroundColor: band.color }]} />
                <TextInput
                  value={band.label}
                  onChangeText={(label) => updateBand(band.id, { label })}
                  style={styles.bandInput}
                  selectionColor={band.color}
                />
                <Text style={styles.range}>{rangeText(band, index)}</Text>
              </View>
              {band.minimum > 0 ? (
                <Slider
                  minimumValue={min}
                  maximumValue={Math.max(min, max)}
                  step={1}
                  value={band.minimum}
                  minimumTrackTintColor={band.color}
                  maximumTrackTintColor={colors.surfaceSoft}
                  thumbTintColor={band.color}
                  onValueChange={(value) => updateThreshold(band, index, value)}
                />
              ) : (
                <Text style={styles.fixedRange}>
                  Lowest band always begins at 0%.
                </Text>
              )}
              <View style={styles.palette}>
                {palette.map((swatch) => (
                  <Pressable
                    key={swatch}
                    accessibilityLabel={`Use color ${swatch}`}
                    onPress={() => updateBand(band.id, { color: swatch })}
                    style={[
                      styles.swatch,
                      { backgroundColor: swatch },
                      band.color === swatch && styles.swatchActive,
                    ]}
                  >
                    {band.color === swatch ? (
                      <MaterialCommunityIcons
                        name="check"
                        color={colors.background}
                        size={13}
                      />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </Card>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Card appearance</Text>
      <Text style={styles.sectionHint}>
        Choose where your subject and attendance colors should appear.
      </Text>
      <Card style={styles.appearanceCard}>
        <Text style={styles.appearanceLabel}>Attendance percentages</Text>
        <View style={styles.optionRow}>
          {percentageColorOptions.map((option) => {
            const selected =
              settings.cardAppearance.percentageColorMode === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() =>
                  updateSettings({
                    cardAppearance: {
                      ...settings.cardAppearance,
                      percentageColorMode: option.value,
                    },
                  })
                }
                style={[
                  styles.option,
                  selected && styles.optionSelected,
                ]}
              >
                <View
                  style={[
                    styles.optionDot,
                    {
                      backgroundColor:
                        option.value === 'band'
                          ? getColorBand(
                              previewPercentage,
                              settings.colorBands,
                            ).color
                          : colors.text,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.appearanceDivider} />
        <Text style={styles.appearanceLabel}>Subject names</Text>
        <View style={styles.optionRow}>
          {subjectNameColorOptions.map((option) => {
            const selected =
              settings.cardAppearance.subjectNameColorMode === option.value;
            const previewBand = getColorBand(
              previewPercentage,
              settings.colorBands,
            );
            const dotColor =
              option.value === 'subject'
                ? (preview?.color ?? colors.cyan)
                : option.value === 'band'
                  ? previewBand.color
                  : colors.text;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() =>
                  updateSettings({
                    cardAppearance: {
                      ...settings.cardAppearance,
                      subjectNameColorMode: option.value,
                    },
                  })
                }
                style={[
                  styles.option,
                  selected && styles.optionSelected,
                ]}
              >
                <View
                  style={[styles.optionDot, { backgroundColor: dotColor }]}
                />
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Live preview</Text>
      <Card style={styles.previewCard}>
        {preview ? (
          <SubjectCard
            subject={preview}
            band={getColorBand(previewPercentage, settings.colorBands)}
            appearance={settings.cardAppearance}
            preview
          />
        ) : (
          <Text style={styles.previewEmpty}>Add a subject to preview your bands.</Text>
        )}
      </Card>

      <View style={styles.applyRow}>
        <View style={styles.applyIcon}>
          <MaterialCommunityIcons name="palette-outline" color={colors.text} size={23} />
        </View>
        <View style={styles.applyCopy}>
          <Text style={styles.applyTitle}>Apply to all subject cards</Text>
          <Text style={styles.applySubtitle}>
            Keep heatmap and card colors consistent.
          </Text>
        </View>
        <Switch
          value={settings.applyBandsGlobally}
          onValueChange={(applyBandsGlobally) => {
            updateSettings({ applyBandsGlobally });
            if (applyBandsGlobally) {
              Alert.alert(
                'Colors applied globally',
                'Your updated bands now control every subject card and attendance indicator.',
              );
            }
          }}
          trackColor={{ false: colors.surfaceSoft, true: colors.limeDark }}
          thumbColor={settings.applyBandsGlobally ? colors.lime : colors.muted}
        />
      </View>

      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.settingsList}>
        <SettingsRow
          icon="bell-ring-outline"
          iconColor={colors.lime}
          title="Daily reminder"
          subtitle={`Reminder time: ${settings.notifications.reminderTime}`}
          right={
            <Switch
              value={settings.notifications.dailyReminderEnabled}
              onValueChange={(dailyReminderEnabled) =>
                updateNotifications({ dailyReminderEnabled })
              }
              trackColor={{ false: colors.surfaceSoft, true: colors.limeDark }}
              thumbColor={
                settings.notifications.dailyReminderEnabled
                  ? colors.lime
                  : colors.muted
              }
            />
          }
        />
        {settings.notifications.dailyReminderEnabled ? (
          <SettingsRow
            icon="clock-outline"
            title="Reminder time"
            subtitle="Schedules a device-local notification every day."
            onPress={() => setShowTimePicker(true)}
            right={<Text style={styles.time}>{settings.notifications.reminderTime}</Text>}
          />
        ) : null}
        <SettingsRow
          icon="alert-outline"
          iconColor={colors.warning}
          title="Low attendance alert"
          subtitle="Alert when a subject drops into your At Risk band."
          right={
            <Switch
              value={settings.notifications.lowAttendanceAlertEnabled}
              onValueChange={(lowAttendanceAlertEnabled) =>
                updateNotifications({ lowAttendanceAlertEnabled })
              }
              trackColor={{ false: colors.surfaceSoft, true: colors.limeDark }}
              thumbColor={
                settings.notifications.lowAttendanceAlertEnabled
                  ? colors.lime
                  : colors.muted
              }
            />
          }
        />
      </View>

      {showTimePicker ? (
        <DateTimePicker
          value={dateFromTime(settings.notifications.reminderTime)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          themeVariant="dark"
        />
      ) : null}

      <Text style={styles.sectionTitle}>Export data</Text>
      <View style={styles.settingsList}>
        <SettingsRow
          icon="file-pdf-box"
          iconColor={colors.danger}
          title="Export all as PDF"
          subtitle="A print-ready attendance report for every subject."
          onPress={exporting ? undefined : () => runExport('pdf')}
        />
        <SettingsRow
          icon="file-excel-outline"
          iconColor={colors.success}
          title="Export all as Excel"
          subtitle="One workbook with summary and attendance records."
          onPress={exporting ? undefined : () => runExport('excel')}
        />
      </View>

      <Text style={styles.sectionTitle}>Backup & sync</Text>
      <SettingsRow
        icon={profile.authMode === 'signed-in' ? 'cloud-check-outline' : 'cloud-off-outline'}
        iconColor={profile.authMode === 'signed-in' ? colors.cyan : colors.muted}
        title={profile.authMode === 'signed-in' ? 'Google backup connected' : 'Local-only mode'}
        subtitle={
          profile.authMode === 'signed-in'
            ? `Last synced ${profile.lastSyncedAt ?? 'just now'}`
            : 'Cloud backup is disabled in the Expo Go test branch.'
        }
        onPress={() =>
          Alert.alert(
            'Backup & sync',
            profile.authMode === 'signed-in'
              ? 'Manual sync will run after Firebase credentials are configured.'
              : 'Switch to the launch branch and use a development build to test Google backup.',
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  reset: {
    color: colors.cyan,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  sectionTitle: {
    marginTop: 13,
    marginBottom: 7,
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  sectionHint: {
    marginTop: -5,
    marginBottom: 9,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  targetCard: {
    padding: 14,
  },
  targetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetLabel: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  targetHint: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
  },
  targetValue: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  targetNumber: {
    color: colors.lime,
    fontFamily: fonts.bold,
    fontSize: 29,
  },
  targetSymbol: {
    marginTop: 5,
    color: colors.lime,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  sliderLabels: {
    marginTop: -7,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    color: colors.faint,
    fontFamily: fonts.medium,
    fontSize: 8,
  },
  bandList: {
    gap: 8,
  },
  bandCard: {
    padding: 11,
  },
  bandTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bandDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  bandInput: {
    flex: 1,
    minHeight: 30,
    paddingVertical: 2,
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  range: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 9.5,
  },
  fixedRange: {
    marginTop: 5,
    color: colors.faint,
    fontFamily: fonts.regular,
    fontSize: 8.5,
  },
  palette: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 9,
  },
  swatch: {
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: colors.white,
  },
  appearanceCard: {
    padding: 12,
  },
  appearanceLabel: {
    marginBottom: 8,
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  option: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionSelected: {
    borderColor: colors.cyan,
    backgroundColor: `${colors.cyan}14`,
  },
  optionDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  optionText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 9,
  },
  optionTextSelected: {
    color: colors.text,
  },
  appearanceDivider: {
    height: 1,
    marginVertical: 12,
    backgroundColor: colors.border,
  },
  previewCard: {
    padding: 10,
  },
  previewEmpty: {
    padding: 12,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  applyRow: {
    minHeight: 72,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCopy: {
    flex: 1,
  },
  applyTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  applySubtitle: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
  },
  settingsList: {
    gap: 7,
  },
  time: {
    color: colors.lime,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});
