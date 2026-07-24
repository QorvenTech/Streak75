import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { STATUS_META } from '../constants/attendance';
import { colors, fonts, radii } from '../constants/theme';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { formatFullDate } from '../utils/dates';

const statuses: AttendanceStatus[] = [
  'present',
  'absent',
  'leave',
  'holiday',
  'no-class',
];

interface RecordEditorContentProps {
  date: string;
  record?: AttendanceRecord;
  onClose: () => void;
  onSave: (status: AttendanceStatus, note: string) => void;
  onDelete?: () => void;
}

function RecordEditorContent({
  date,
  record,
  onClose,
  onSave,
  onDelete,
}: RecordEditorContentProps) {
  const [status, setStatus] = useState<AttendanceStatus>(record?.status ?? 'present');
  const [note, setNote] = useState(record?.note ?? '');

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <Text style={styles.title}>Mark attendance</Text>
      <Text style={styles.date}>{formatFullDate(date)}</Text>
      <View style={styles.statuses}>
        {statuses.map((item) => {
          const meta = STATUS_META[item];
          const selected = status === item;
          return (
            <Pressable
              key={item}
              onPress={() => setStatus(item)}
              style={[
                styles.status,
                {
                  borderColor: selected ? meta.color : colors.border,
                  backgroundColor: selected ? `${meta.color}24` : colors.surface,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={meta.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                color={selected ? meta.color : colors.muted}
                size={21}
              />
              <Text style={[styles.statusLabel, selected && { color: meta.color }]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.noteLabel}>Note (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="What happened in class?"
        placeholderTextColor={colors.faint}
        multiline
        textAlignVertical="top"
        style={styles.input}
      />
      <View style={styles.actions}>
        <Pressable onPress={onClose} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        {record && onDelete ? (
          <Pressable
            onPress={() =>
              Alert.alert(
                'Clear this date?',
                'The attendance status and note for this date will be removed.',
                [
                  { text: 'Keep record', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                      onDelete();
                      onClose();
                    },
                  },
                ],
              )
            }
            style={styles.delete}
          >
            <Text style={styles.deleteText}>Clear</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => {
            onSave(status, note);
            onClose();
          }}
          style={styles.save}
        >
          <Text style={styles.saveText}>Save record</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface RecordEditorModalProps {
  visible: boolean;
  date: string | null;
  record?: AttendanceRecord;
  onClose: () => void;
  onSave: (status: AttendanceStatus, note: string) => void;
  onDelete?: () => void;
}

export function RecordEditorModal({
  visible,
  date,
  record,
  onClose,
  onSave,
  onDelete,
}: RecordEditorModalProps) {
  return (
    <Modal visible={visible && !!date} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {date ? (
          <RecordEditorContent
            key={`${date}-${record?.updatedAt ?? 'new'}`}
            date={date}
            record={record}
            onClose={onClose}
            onSave={onSave}
            onDelete={onDelete}
          />
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    padding: 20,
    paddingBottom: 34,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.borderStrong,
    backgroundColor: colors.backgroundElevated,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    marginBottom: 18,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  date: {
    marginTop: 2,
    color: colors.cyan,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  statuses: {
    marginVertical: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  status: {
    width: '31.5%',
    minHeight: 67,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statusLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 9.5,
  },
  noteLabel: {
    marginBottom: 7,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  input: {
    minHeight: 88,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  cancel: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  delete: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: `${colors.danger}88`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: colors.danger,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  save: {
    flex: 1.5,
    minHeight: 48,
    borderRadius: radii.md,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});
