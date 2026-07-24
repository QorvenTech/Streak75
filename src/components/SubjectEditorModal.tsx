import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SubjectIconId } from '../constants/subjectIconAssets';
import {
  getSubjectIcon,
  suggestSubjectIcon,
} from '../constants/subjectIconMap';
import { colors, fonts, radii, spacing } from '../constants/theme';
import { Subject } from '../types';
import { openingTotals } from '../utils/records';
import { SubjectIconImage } from './SubjectIconImage';
import { SubjectIconPickerModal } from './SubjectIconPickerModal';

const subjectColors = [
  colors.lime,
  colors.cyan,
  colors.purple,
  colors.warning,
  colors.orange,
  '#47D98B',
];

export interface SubjectEditorInput {
  name: string;
  professor: string;
  icon: string;
  iconId: SubjectIconId;
  iconSelectionSource: 'auto' | 'manual';
  color: string;
  classesHeld: number;
  classesAttended: number;
}

interface SubjectEditorModalProps {
  visible: boolean;
  subject?: Subject;
  onClose: () => void;
  onSubmit: (input: SubjectEditorInput) => void;
  onDelete?: () => void;
}

export function SubjectEditorModal({
  visible,
  subject,
  onClose,
  onSubmit,
  onDelete,
}: SubjectEditorModalProps) {
  const [name, setName] = useState('');
  const [professor, setProfessor] = useState('');
  const [iconId, setIconId] =
    useState<SubjectIconId>('generic-subject');
  const [iconSelectionSource, setIconSelectionSource] = useState<
    'auto' | 'manual'
  >('auto');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [color, setColor] = useState<string>(colors.lime);
  const [classesHeld, setClassesHeld] = useState('');
  const [classesAttended, setClassesAttended] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    const opening = subject ? openingTotals(subject) : { held: 0, attended: 0 };
    const suggested = suggestSubjectIcon(subject?.name ?? '');
    setName(subject?.name ?? '');
    setProfessor(subject?.professor ?? '');
    setIconId(subject?.iconId ?? suggested.id);
    setIconSelectionSource(
      subject?.iconId
        ? (subject.iconSelectionSource ?? 'manual')
        : 'auto',
    );
    setColor(subject?.color ?? colors.lime);
    setClassesHeld(opening.held ? `${opening.held}` : '');
    setClassesAttended(opening.attended ? `${opening.attended}` : '');
    setError(null);
    setPickerVisible(false);
  }, [subject, visible]);

  useEffect(() => {
    if (!visible || iconSelectionSource === 'manual') return;
    const timeout = setTimeout(() => {
      setIconId(suggestSubjectIcon(name).id);
    }, 180);
    return () => clearTimeout(timeout);
  }, [iconSelectionSource, name, visible]);

  const close = () => {
    setPickerVisible(false);
    onClose();
  };

  const submit = () => {
    const held = Number(classesHeld) || 0;
    const attended = Number(classesAttended) || 0;
    const finalIconId =
      iconSelectionSource === 'auto'
        ? suggestSubjectIcon(name).id
        : iconId;
    if (!name.trim()) {
      setError('Enter a subject name.');
      return;
    }
    if (attended > held) {
      setError('Classes attended cannot be greater than classes held.');
      return;
    }
    onSubmit({
      name: name.trim(),
      professor: professor.trim(),
      icon: subject?.icon ?? 'book-open-variant',
      iconId: finalIconId,
      iconSelectionSource,
      color,
      classesHeld: held,
      classesAttended: attended,
    });
    close();
  };

  const editing = !!subject;
  const selectedIcon = getSubjectIcon(iconId);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.headingRow}>
              <View>
                <Text style={styles.title}>
                  {editing ? 'Edit subject' : 'Add a subject'}
                </Text>
                <Text style={styles.subtitle}>
                  {editing
                    ? 'Correct details without losing attendance.'
                    : 'Start tracking a new class.'}
                </Text>
              </View>
              <Pressable onPress={close} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" color={colors.text} size={20} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Subject name</Text>
              <View style={styles.nameRow}>
                <TextInput
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    setError(null);
                  }}
                  placeholder="e.g. Business Statistics"
                  placeholderTextColor={colors.faint}
                  style={[styles.input, styles.nameInput]}
                  autoFocus
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Change ${selectedIcon.label} icon`}
                  onPress={() => setPickerVisible(true)}
                  style={({ pressed }) => [
                    styles.liveIcon,
                    pressed && styles.pressed,
                  ]}
                >
                  <SubjectIconImage iconId={iconId} size={47} />
                  <Text style={styles.changeIcon}>Change</Text>
                </Pressable>
              </View>
              <View style={styles.iconMeta}>
                <View style={styles.iconMetaCopy}>
                  <MaterialCommunityIcons
                    name={
                      iconSelectionSource === 'auto'
                        ? 'auto-fix'
                        : 'gesture-tap-button'
                    }
                    color={
                      iconSelectionSource === 'auto'
                        ? colors.lime
                        : colors.cyan
                    }
                    size={15}
                  />
                  <Text style={styles.iconMetaText} numberOfLines={1}>
                    {iconSelectionSource === 'auto'
                      ? `Suggested: ${selectedIcon.label}`
                      : `Manual: ${selectedIcon.label}`}
                  </Text>
                </View>
                {iconSelectionSource === 'manual' ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setIconSelectionSource('auto');
                      setIconId(suggestSubjectIcon(name).id);
                    }}
                  >
                    <Text style={styles.useAuto}>Use auto</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.label}>Faculty / professor (optional)</Text>
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
                    accessibilityLabel={`Use color ${item}`}
                    onPress={() => setColor(item)}
                    style={[
                      styles.swatch,
                      { backgroundColor: item },
                      color === item && styles.swatchSelected,
                    ]}
                  >
                    {color === item ? (
                      <MaterialCommunityIcons
                        name="check"
                        color={colors.background}
                        size={17}
                      />
                    ) : null}
                  </Pressable>
                ))}
              </View>

            <Text style={styles.label}>Opening attendance totals</Text>
            <Text style={styles.openingHint}>
              These are classes recorded before you started adding dated entries.
            </Text>
            <View style={styles.totalRow}>
              <View style={styles.totalField}>
                <Text style={styles.totalLabel}>Classes held</Text>
                <TextInput
                  value={classesHeld}
                  onChangeText={(value) => {
                    setClassesHeld(value.replace(/\D/g, ''));
                    setError(null);
                  }}
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
                  onChangeText={(value) => {
                    setClassesAttended(value.replace(/\D/g, ''));
                    setError(null);
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.faint}
                  keyboardType="number-pad"
                  style={[styles.input, styles.totalInput]}
                />
              </View>
            </View>

            {editing ? (
              <View style={styles.calculated}>
                <MaterialCommunityIcons
                  name="calculator-variant-outline"
                  color={colors.cyan}
                  size={18}
                />
                <Text style={styles.calculatedText}>
                  Current calculated total: {subject.classesAttended} attended /{' '}
                  {subject.classesHeld} held
                </Text>
              </View>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              {editing && onDelete ? (
                <Pressable onPress={onDelete} style={styles.delete}>
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    color={colors.danger}
                    size={19}
                  />
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={submit}
                style={({ pressed }) => [
                  styles.submit,
                  editing && onDelete ? styles.submitWithDelete : undefined,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.submitText}>
                  {editing ? 'Save changes' : 'Add subject'}
                </Text>
              </Pressable>
            </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <SubjectIconPickerModal
        visible={pickerVisible}
        selectedIconId={iconId}
        onClose={() => setPickerVisible(false)}
        onSelect={(selectedIconId) => {
          setIconId(selectedIconId);
          setIconSelectionSource('manual');
          setPickerVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: '94%',
    padding: spacing.xl,
    paddingBottom: 28,
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
  headingRow: {
    marginBottom: 18,
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
    fontSize: 11,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  nameInput: {
    flex: 1,
  },
  liveIcon: {
    width: 70,
    height: 64,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeIcon: {
    marginTop: -2,
    color: colors.cyan,
    fontFamily: fonts.semiBold,
    fontSize: 8,
  },
  iconMeta: {
    minHeight: 34,
    marginTop: -7,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: `${colors.cyan}08`,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconMetaCopy: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconMetaText: {
    minWidth: 0,
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 9.5,
  },
  useAuto: {
    color: colors.lime,
    fontFamily: fonts.semiBold,
    fontSize: 9,
  },
  palette: {
    marginBottom: 18,
    flexDirection: 'row',
    gap: 12,
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
  openingHint: {
    marginTop: -4,
    marginBottom: 9,
    color: colors.faint,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
  },
  totalRow: {
    marginBottom: 8,
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
  calculated: {
    minHeight: 43,
    marginBottom: 12,
    paddingHorizontal: 11,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: `${colors.cyan}44`,
    backgroundColor: `${colors.cyan}0D`,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calculatedText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 9.5,
  },
  error: {
    marginBottom: 10,
    color: colors.danger,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  delete: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: `${colors.danger}77`,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteText: {
    color: colors.danger,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  submit: {
    flex: 1,
    minHeight: 50,
    borderRadius: radii.md,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitWithDelete: {
    flex: 1,
  },
  submitText: {
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.75,
  },
});
