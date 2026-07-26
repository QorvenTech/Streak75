import { useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View, } from 'react-native';

import { fonts, radii, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';
import { formatFullDate } from '../utils/dates';

interface NoteEditorModalProps {
  visible: boolean;
  date: string;
  initialValue?: string;
  onClose: () => void;
  onSave: (note: string) => void;
}

export function NoteEditorModal({
  visible,
  date,
  initialValue = '',
  onClose,
  onSave,
}: NoteEditorModalProps) {
  const { colors, styles } = useThemedStyles(createStyles);
  const [value, setValue] = useState(initialValue);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => setValue(initialValue)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.dialog}>
          <Text style={styles.title}>Class note</Text>
          <Text style={styles.date}>{formatFullDate(date)}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Add a reminder, syllabus update, or assignment…"
            placeholderTextColor={colors.faint}
            style={styles.input}
            multiline
            autoFocus
            textAlignVertical="top"
          />
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondary}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onSave(value);
                onClose();
              }}
              style={styles.primary}
            >
              <Text style={styles.primaryText}>Save note</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 22,
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  dialog: {
    padding: 20,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.backgroundElevated,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 21,
  },
  date: {
    marginTop: 2,
    color: colors.cyan,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  input: {
    minHeight: 130,
    marginTop: 18,
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  secondary: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  primary: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: colors.lime,
  },
  primaryText: {
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});
