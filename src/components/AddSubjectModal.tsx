import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, fonts, radii, spacing } from '../constants/theme';

const subjectColors = [
  colors.lime,
  colors.cyan,
  colors.purple,
  colors.warning,
  colors.orange,
  '#47D98B',
];

interface AddSubjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    professor: string;
    icon: string;
    color: string;
    classesHeld: number;
    classesAttended: number;
  }) => void;
}

export function AddSubjectModal({
  visible,
  onClose,
  onSubmit,
}: AddSubjectModalProps) {
  const [name, setName] = useState('');
  const [professor, setProfessor] = useState('');
  const [color, setColor] = useState<string>(colors.lime);
  const [classesHeld, setClassesHeld] = useState('');
  const [classesAttended, setClassesAttended] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      professor: professor.trim(),
      icon: 'book-open-variant',
      color,
      classesHeld: Number(classesHeld) || 0,
      classesAttended: Math.min(
        Number(classesHeld) || 0,
        Number(classesAttended) || 0,
      ),
    });
    setName('');
    setProfessor('');
    setColor(colors.lime);
    setClassesHeld('');
    setClassesAttended('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headingRow}>
            <View>
              <Text style={styles.title}>Add a subject</Text>
              <Text style={styles.subtitle}>Start tracking a new class.</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" color={colors.text} size={20} />
            </Pressable>
          </View>
          <Text style={styles.label}>Subject name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Business Statistics"
            placeholderTextColor={colors.faint}
            style={styles.input}
            autoFocus
          />
          <Text style={styles.label}>Professor (optional)</Text>
          <TextInput
            value={professor}
            onChangeText={setProfessor}
            placeholder="e.g. Prof. Rao"
            placeholderTextColor={colors.faint}
            style={styles.input}
          />
          <Text style={styles.label}>Subject color</Text>
          <View style={styles.palette}>
            {subjectColors.map((item) => (
              <Pressable
                key={item}
                onPress={() => setColor(item)}
                style={[
                  styles.swatch,
                  { backgroundColor: item },
                  color === item && styles.swatchSelected,
                ]}
              >
                {color === item ? (
                  <MaterialCommunityIcons name="check" color={colors.background} size={17} />
                ) : null}
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Starting totals (optional)</Text>
          <View style={styles.totalRow}>
            <View style={styles.totalField}>
              <Text style={styles.totalLabel}>Classes held</Text>
              <TextInput
                value={classesHeld}
                onChangeText={(value) => setClassesHeld(value.replace(/\D/g, ''))}
                placeholder="0"
                placeholderTextColor={colors.faint}
                keyboardType="number-pad"
                style={[styles.input, styles.totalInput]}
              />
            </View>
            <View style={styles.totalField}>
              <Text style={styles.totalLabel}>Classes attended</Text>
              <TextInput
                value={classesAttended}
                onChangeText={(value) =>
                  setClassesAttended(value.replace(/\D/g, ''))
                }
                placeholder="0"
                placeholderTextColor={colors.faint}
                keyboardType="number-pad"
                style={[styles.input, styles.totalInput]}
              />
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!name.trim()}
            onPress={submit}
            style={({ pressed }) => [
              styles.submit,
              !name.trim() && styles.submitDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.submitText}>Add subject</Text>
          </Pressable>
        </View>
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
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.borderStrong,
    backgroundColor: colors.backgroundElevated,
    padding: spacing.xl,
    paddingBottom: 34,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    marginBottom: 18,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  headingRow: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  subtitle: {
    marginTop: 3,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginBottom: 7,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  input: {
    minHeight: 48,
    marginBottom: 16,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  palette: {
    marginBottom: 18,
    flexDirection: 'row',
    gap: 12,
  },
  totalRow: {
    marginBottom: 18,
    flexDirection: 'row',
    gap: 10,
  },
  totalField: {
    flex: 1,
  },
  totalLabel: {
    marginBottom: 5,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 9,
  },
  totalInput: {
    marginBottom: 0,
    textAlign: 'center',
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: colors.white,
  },
  submit: {
    minHeight: 50,
    borderRadius: radii.md,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    opacity: 0.35,
  },
  submitText: {
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.75,
  },
});
