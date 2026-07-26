import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';

import { AttendanceLegend } from '../components/AttendanceLegend';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { Card } from '../components/Card';
import { RecordEditorModal } from '../components/RecordEditorModal';
import { Screen } from '../components/Screen';
import { fonts, radii, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';
import { useApp } from '../store/AppProvider';
import { getColorBand, roundedAttendance } from '../utils/attendance';
import { shiftMonth } from '../utils/dates';

export function CalendarScreen() {
  const { colors, styles } = useThemedStyles(createStyles);
  const {
    subjects,
    selectedSubject,
    settings,
    setSelectedSubjectId,
    saveAttendanceRecord,
    removeAttendanceRecord,
  } = useApp();
  const [month, setMonth] = useState(new Date());
  const [editorDate, setEditorDate] = useState<string | null>(null);

  if (!selectedSubject) {
    return (
      <Screen scroll={false} contentContainerStyle={styles.empty}>
        <MaterialCommunityIcons name="calendar-remove-outline" color={colors.muted} size={42} />
        <Text style={styles.emptyTitle}>Add a subject to use the calendar.</Text>
      </Screen>
    );
  }

  const percentage = roundedAttendance(
    selectedSubject.classesAttended,
    selectedSubject.classesHeld,
  );
  const band = getColorBand(percentage, settings.colorBands);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Attendance calendar</Text>
          <Text style={styles.subtitle}>Tap any date to mark or edit a class.</Text>
        </View>
        <View style={[styles.scorePill, { borderColor: `${band.color}88` }]}>
          <Text style={[styles.score, { color: band.color }]}>{percentage}%</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subjects}
      >
        {subjects.map((subject) => {
          const active = selectedSubject.id === subject.id;
          return (
            <Pressable
              key={subject.id}
              onPress={() => setSelectedSubjectId(subject.id)}
              style={[
                styles.subjectChip,
                active && {
                  borderColor: subject.color,
                  backgroundColor: `${subject.color}20`,
                },
              ]}
            >
              <View style={[styles.subjectDot, { backgroundColor: subject.color }]} />
              <Text style={[styles.subjectName, active && styles.subjectNameActive]}>
                {subject.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Card style={styles.calendarCard}>
        <CalendarHeatmap
          subject={selectedSubject}
          month={month}
          onPreviousMonth={() => setMonth((current) => shiftMonth(current, -1))}
          onNextMonth={() => setMonth((current) => shiftMonth(current, 1))}
          onDayPress={setEditorDate}
        />
      </Card>
      <AttendanceLegend />
      <Card style={styles.tip}>
        <MaterialCommunityIcons name="gesture-tap" color={colors.cyan} size={22} />
        <View style={styles.tipCopy}>
          <Text style={styles.tipTitle}>Fast correction</Text>
          <Text style={styles.tipText}>
            Select another subject above, then tap a day to update its attendance or note.
          </Text>
        </View>
      </Card>

      <RecordEditorModal
        visible={!!editorDate}
        date={editorDate}
        record={editorDate ? selectedSubject.records[editorDate] : undefined}
        onClose={() => setEditorDate(null)}
        onSave={(status, note) => {
          if (!editorDate) return;
          saveAttendanceRecord(selectedSubject.id, editorDate, status, note);
        }}
        onDelete={
          editorDate
            ? () => removeAttendanceRecord(selectedSubject.id, editorDate)
            : undefined
        }
      />
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  empty: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  header: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 21,
  },
  subtitle: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  scorePill: {
    minWidth: 54,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
  },
  score: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  subjects: {
    paddingBottom: 12,
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subjectDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  subjectName: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  subjectNameActive: {
    color: colors.text,
  },
  calendarCard: {
    padding: 11,
  },
  tip: {
    marginTop: 2,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  tipCopy: {
    flex: 1,
  },
  tipTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  tipText: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
  },
});
