import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AttendanceLegend } from '../components/AttendanceLegend';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { Card } from '../components/Card';
import { CircularProgress } from '../components/CircularProgress';
import { PageHeader } from '../components/PageHeader';
import { RecordEditorModal } from '../components/RecordEditorModal';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { SubjectEditorModal } from '../components/SubjectEditorModal';
import { colors, fonts, radii } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import {
  exportSubjectExcel,
  exportSubjectPdf,
} from '../services/exports';
import { useApp } from '../store/AppProvider';
import { getColorBand, roundedAttendance } from '../utils/attendance';
import { formatShortDate, shiftMonth, toDateKey } from '../utils/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'SubjectDetail'>;

export function SubjectDetailScreen({ navigation, route }: Props) {
  const {
    subjects,
    settings,
    saveAttendanceRecord,
    removeAttendanceRecord,
    toggleFavorite,
    setSelectedSubjectId,
    updateSubject,
    deleteSubject,
  } = useApp();
  const subject = subjects.find((item) => item.id === route.params.subjectId);
  const [month, setMonth] = useState(new Date());
  const [editorDate, setEditorDate] = useState<string | null>(null);
  const [editSubjectVisible, setEditSubjectVisible] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const notes = useMemo(
    () =>
      subject
        ? Object.values(subject.records)
            .filter((record) => !!record.note)
            .sort((a, b) => b.date.localeCompare(a.date))
        : [],
    [subject],
  );

  if (!subject) {
    return (
      <Screen scroll={false} contentContainerStyle={styles.missing}>
        <Text style={styles.missingTitle}>Subject not found</Text>
        <Pressable onPress={navigation.goBack}>
          <Text style={styles.backLink}>Return home</Text>
        </Pressable>
      </Screen>
    );
  }

  const percentage = roundedAttendance(subject.classesAttended, subject.classesHeld);
  const band = getColorBand(percentage, settings.colorBands);
  const bunked = Math.max(0, subject.classesHeld - subject.classesAttended);
  const runExport = async (format: 'pdf' | 'excel') => {
    setExporting(format);
    try {
      if (format === 'pdf') {
        await exportSubjectPdf(subject, settings);
      } else {
        await exportSubjectExcel(subject, settings);
      }
    } catch (error) {
      Alert.alert(
        'Export failed',
        error instanceof Error ? error.message : 'The report could not be created.',
      );
    } finally {
      setExporting(null);
    }
  };

  return (
    <Screen>
      <PageHeader
        title={subject.name}
        subtitle={subject.professor}
        onBack={navigation.goBack}
        right={
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit subject"
              hitSlop={8}
              onPress={() => setEditSubjectVisible(true)}
              style={styles.headerButton}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                color={colors.cyan}
                size={22}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                subject.favorite
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              }
              hitSlop={8}
              onPress={() => toggleFavorite(subject.id)}
              style={styles.headerButton}
            >
              <MaterialCommunityIcons
                name={subject.favorite ? 'star' : 'star-outline'}
                color={subject.favorite ? colors.lime : colors.text}
                size={25}
              />
            </Pressable>
          </View>
        }
      />

      <Card style={styles.summary}>
        <CircularProgress
          percentage={percentage}
          size={126}
          strokeWidth={11}
          color={band.color}
          label={band.label}
        />
        <View style={styles.stats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Classes attended</Text>
            <Text style={styles.statValue}>
              {subject.classesAttended}
              <Text style={styles.statMuted}> / {subject.classesHeld}</Text>
            </Text>
          </View>
          <View style={styles.line} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Bunked / leave</Text>
            <Text style={styles.statValue}>{bunked}</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Target</Text>
            <Text style={[styles.statValue, { color: colors.lime }]}>
              {settings.targetPercentage}%
            </Text>
          </View>
        </View>
      </Card>

      <AttendanceLegend />
      <Card style={styles.calendarCard}>
        <CalendarHeatmap
          subject={subject}
          month={month}
          onPreviousMonth={() => setMonth((current) => shiftMonth(current, -1))}
          onNextMonth={() => setMonth((current) => shiftMonth(current, 1))}
          onDayPress={(date) => {
            setSelectedSubjectId(subject.id);
            setEditorDate(date);
          }}
        />
      </Card>

      <SectionHeader
        title="Notes"
        actionLabel="+ Add note"
        onActionPress={() => setEditorDate(toDateKey(new Date()))}
      />
      <View style={styles.notes}>
        {notes.length ? (
          notes.map((record) => (
            <Pressable
              key={record.date}
              onPress={() => setEditorDate(record.date)}
              style={({ pressed }) => [styles.note, pressed && styles.pressed]}
            >
              <View style={styles.noteDate}>
                <MaterialCommunityIcons name="note-text-outline" color={colors.note} size={18} />
                <Text style={styles.noteDateText}>{formatShortDate(record.date)}</Text>
              </View>
              <Text style={styles.noteText} numberOfLines={2}>
                {record.note}
              </Text>
              <MaterialCommunityIcons name="chevron-right" color={colors.muted} size={19} />
            </Pressable>
          ))
        ) : (
          <Card style={styles.emptyNotes}>
            <MaterialCommunityIcons name="notebook-outline" color={colors.muted} size={24} />
            <Text style={styles.emptyText}>No notes for this subject yet.</Text>
          </Card>
        )}
      </View>

      <View style={styles.exports}>
        <Pressable
          disabled={!!exporting}
          onPress={() => runExport('pdf')}
          style={({ pressed }) => [styles.exportButton, pressed && styles.pressed]}
        >
          {exporting === 'pdf' ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <MaterialCommunityIcons name="file-pdf-box" color={colors.text} size={23} />
          )}
          <Text style={styles.exportText}>Export PDF</Text>
        </Pressable>
        <Pressable
          disabled={!!exporting}
          onPress={() => runExport('excel')}
          style={({ pressed }) => [styles.exportButton, pressed && styles.pressed]}
        >
          {exporting === 'excel' ? (
            <ActivityIndicator color={colors.lime} size="small" />
          ) : (
            <MaterialCommunityIcons name="file-excel-outline" color={colors.lime} size={23} />
          )}
          <Text style={styles.exportText}>Export Excel</Text>
        </Pressable>
      </View>

      <RecordEditorModal
        visible={!!editorDate}
        date={editorDate}
        record={editorDate ? subject.records[editorDate] : undefined}
        onClose={() => setEditorDate(null)}
        onSave={(status, note) => {
          if (!editorDate) return;
          saveAttendanceRecord(subject.id, editorDate, status, note);
        }}
        onDelete={
          editorDate
            ? () => removeAttendanceRecord(subject.id, editorDate)
            : undefined
        }
      />
      <SubjectEditorModal
        visible={editSubjectVisible}
        subject={subject}
        onClose={() => setEditSubjectVisible(false)}
        onSubmit={(input) =>
          updateSubject(subject.id, {
            name: input.name,
            professor: input.professor || undefined,
            icon: input.icon,
            iconId: input.iconId,
            iconSelectionSource: input.iconSelectionSource,
            color: input.color,
            openingClassesHeld: input.classesHeld,
            openingClassesAttended: input.classesAttended,
          })
        }
        onDelete={() =>
          Alert.alert(
            'Delete subject?',
            `${subject.name} and all of its attendance records will be permanently removed from this device.`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  setEditSubjectVisible(false);
                  deleteSubject(subject.id);
                  navigation.goBack();
                },
              },
            ],
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  backLink: {
    marginTop: 10,
    color: colors.cyan,
    fontFamily: fonts.medium,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 38,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  stats: {
    flex: 1,
  },
  statRow: {
    minHeight: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  statValue: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  statMuted: {
    color: colors.muted,
    fontSize: 10,
  },
  line: {
    height: 1,
    backgroundColor: colors.border,
  },
  calendarCard: {
    marginBottom: 13,
    padding: 10,
  },
  notes: {
    gap: 7,
  },
  note: {
    minHeight: 62,
    padding: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noteDate: {
    width: 61,
    alignItems: 'center',
    gap: 2,
  },
  noteDateText: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 9,
  },
  noteText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  emptyNotes: {
    minHeight: 74,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  exports: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  exportButton: {
    flex: 1,
    minHeight: 55,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.65,
  },
});
