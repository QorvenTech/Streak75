import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { Card } from '../components/Card';
import { CircularProgress } from '../components/CircularProgress';
import { NoteEditorModal } from '../components/NoteEditorModal';
import { QuickAction } from '../components/QuickAction';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { SubjectCard } from '../components/SubjectCard';
import { SubjectEditorModal } from '../components/SubjectEditorModal';
import { colors, fonts, radii } from '../constants/theme';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { useApp } from '../store/AppProvider';
import { aggregateSubjects, getColorBand } from '../utils/attendance';
import { toDateKey } from '../utils/dates';

type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const {
    subjects,
    settings,
    profile,
    selectedSubject,
    markAttendance,
    upsertNote,
    addSubject,
    setSelectedSubjectId,
  } = useApp();
  const [noteVisible, setNoteVisible] = useState(false);
  const [addSubjectVisible, setAddSubjectVisible] = useState(false);
  const totals = useMemo(() => aggregateSubjects(subjects), [subjects]);
  const orderedSubjects = useMemo(
    () =>
      subjects
        .map((subject, index) => ({ subject, index }))
        .sort(
          (a, b) =>
            Number(b.subject.favorite) - Number(a.subject.favorite) ||
            a.index - b.index,
        )
        .map(({ subject }) => subject),
    [subjects],
  );
  const overallBand = getColorBand(totals.percentage, settings.colorBands);
  const today = toDateKey(new Date());

  const quickMark = (status: 'present' | 'absent') => {
    if (!selectedSubject) {
      setAddSubjectVisible(true);
      return;
    }
    markAttendance(selectedSubject.id, today, status);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
  };

  return (
    <Screen>
      <AppHeader
        onNotificationsPress={() =>
          Alert.alert(
            'Daily reminder',
            settings.notifications.dailyReminderEnabled
              ? `Your reminder is set for ${settings.notifications.reminderTime}.`
              : 'Daily reminders are currently turned off.',
          )
        }
      />

      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeading}>
          <View>
            <Text style={styles.eyebrow}>Overall attendance</Text>
            <Text style={[styles.statusText, { color: overallBand.color }]}>
              {overallBand.label} streak
            </Text>
          </View>
          <View style={styles.syncPill}>
            <MaterialCommunityIcons
              name={profile.authMode === 'signed-in' ? 'cloud-check-outline' : 'cloud-off-outline'}
              color={profile.authMode === 'signed-in' ? colors.cyan : colors.muted}
              size={15}
            />
            <View>
              <Text style={styles.syncTitle}>
                {profile.authMode === 'signed-in' ? 'Cloud sync' : 'Local mode'}
              </Text>
              <Text
                style={[
                  styles.syncStatus,
                  profile.syncStatus === 'up-to-date' && { color: colors.success },
                ]}
              >
                {profile.syncStatus === 'up-to-date' ? 'Up to date' : 'Saved offline'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.summaryBody}>
          <CircularProgress
            percentage={totals.percentage}
            size={126}
            strokeWidth={11}
            color={overallBand.color}
            valueColor={
              settings.cardAppearance.percentageColorMode === 'band'
                ? overallBand.color
                : colors.text
            }
            label={overallBand.label}
          />
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Classes attended</Text>
              <Text style={styles.metricValue}>
                {totals.classesAttended}
                <Text style={styles.metricMuted}> / {totals.classesHeld}</Text>
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Subjects tracked</Text>
              <Text style={styles.metricValue}>{subjects.length}</Text>
            </View>
            <View style={styles.targetRow}>
              <MaterialCommunityIcons name="target" color={colors.lime} size={15} />
              <Text style={styles.targetText}>
                Target {settings.targetPercentage}%
              </Text>
            </View>
          </View>
        </View>
      </Card>

      <SectionHeader
        title="Subjects"
        actionLabel="+ Add subject"
        onActionPress={() => setAddSubjectVisible(true)}
      />
      <View style={styles.subjectList}>
        {orderedSubjects.map((subject) => {
          const percentage =
            subject.classesHeld > 0
              ? (subject.classesAttended / subject.classesHeld) * 100
              : 0;
          return (
            <SubjectCard
              key={subject.id}
              subject={subject}
              band={getColorBand(percentage, settings.colorBands)}
              appearance={settings.cardAppearance}
              onPress={() => {
                setSelectedSubjectId(subject.id);
                navigation.navigate('SubjectDetail', { subjectId: subject.id });
              }}
            />
          );
        })}
      </View>

      <SectionHeader title="Quick actions" />
      {subjects.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickSubjectSelector}
        >
          {orderedSubjects.map((subject) => {
            const active = selectedSubject?.id === subject.id;
            return (
              <Pressable
                key={subject.id}
                onPress={() => setSelectedSubjectId(subject.id)}
                style={[
                  styles.quickSubjectChip,
                  active && {
                    borderColor: subject.color,
                    backgroundColor: `${subject.color}1F`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.quickSubjectDot,
                    { backgroundColor: subject.color },
                  ]}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.quickSubjectText,
                    active && styles.quickSubjectTextActive,
                  ]}
                >
                  {subject.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
      <Text style={styles.selectedHint}>
        Marking for{' '}
        <Text style={styles.selectedName}>
          {selectedSubject?.name ?? 'your next subject'}
        </Text>
      </Text>
      <View style={styles.quickActions}>
        <QuickAction
          label="Present"
          icon="check-circle-outline"
          color={colors.success}
          onPress={() => quickMark('present')}
        />
        <QuickAction
          label="Absent"
          icon="close-circle-outline"
          color={colors.danger}
          onPress={() => quickMark('absent')}
        />
        <QuickAction
          label="Bunk Meter"
          icon="speedometer"
          color={colors.cyan}
          onPress={() => navigation.navigate('BunkMeter')}
        />
        <QuickAction
          label="Add note"
          icon="note-edit-outline"
          color={colors.warning}
          onPress={() =>
            selectedSubject ? setNoteVisible(true) : setAddSubjectVisible(true)
          }
        />
      </View>

      <Card style={styles.reminderCard}>
        <View style={styles.reminderIcon}>
          <MaterialCommunityIcons name="bell-ring-outline" color={colors.lime} size={22} />
        </View>
        <View style={styles.reminderCopy}>
          <Text style={styles.reminderTitle}>Daily reminder</Text>
          <Text style={styles.reminderSubtitle}>Don’t forget to mark your classes!</Text>
        </View>
        <View style={styles.reminderTime}>
          <Text style={styles.reminderClock}>
            {settings.notifications.reminderTime}
          </Text>
          <Text style={styles.reminderRepeat}>
            {settings.notifications.dailyReminderEnabled ? 'Every day' : 'Off'}
          </Text>
        </View>
      </Card>

      <Pressable
        onPress={() => navigation.navigate('ColorCustomization')}
        style={({ pressed }) => [styles.customizeBanner, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="palette-outline" color={colors.cyan} size={20} />
        <View style={styles.customizeCopy}>
          <Text style={styles.customizeTitle}>Make the colors yours</Text>
          <Text style={styles.customizeSubtitle}>
            Customize attendance bands and your target.
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" color={colors.cyan} size={20} />
      </Pressable>

      <NoteEditorModal
        visible={noteVisible}
        date={today}
        initialValue={selectedSubject?.records[today]?.note}
        onClose={() => setNoteVisible(false)}
        onSave={(note) => {
          if (selectedSubject) upsertNote(selectedSubject.id, today, note);
        }}
      />
      <SubjectEditorModal
        visible={addSubjectVisible}
        onClose={() => setAddSubjectVisible(false)}
        onSubmit={addSubject}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginTop: 4,
    marginBottom: 14,
    padding: 14,
  },
  summaryHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  statusText: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  syncPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.backgroundElevated,
  },
  syncTitle: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 8,
  },
  syncStatus: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 8,
  },
  summaryBody: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  metrics: {
    flex: 1,
    gap: 9,
  },
  metric: {
    gap: 2,
  },
  metricLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  metricValue: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  metricMuted: {
    color: colors.muted,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  targetText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  subjectList: {
    marginBottom: 12,
    gap: 7,
  },
  selectedHint: {
    marginTop: 1,
    marginBottom: 8,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  selectedName: {
    color: colors.cyan,
    fontFamily: fonts.semiBold,
  },
  quickSubjectSelector: {
    paddingBottom: 6,
    gap: 7,
  },
  quickSubjectChip: {
    maxWidth: 150,
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickSubjectDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  quickSubjectText: {
    flexShrink: 1,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 9.5,
  },
  quickSubjectTextActive: {
    color: colors.text,
  },
  quickActions: {
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  reminderCard: {
    minHeight: 66,
    marginBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.lime}16`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCopy: {
    marginLeft: 10,
    flex: 1,
  },
  reminderTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  reminderSubtitle: {
    marginTop: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  reminderTime: {
    alignItems: 'flex-end',
  },
  reminderClock: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  reminderRepeat: {
    color: colors.lime,
    fontFamily: fonts.medium,
    fontSize: 9,
  },
  customizeBanner: {
    minHeight: 64,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: `${colors.cyan}0D`,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  customizeCopy: {
    flex: 1,
  },
  customizeTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  customizeSubtitle: {
    marginTop: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  pressed: {
    opacity: 0.7,
  },
});
