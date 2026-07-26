import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  filterSubjectIcons, SUBJECT_ICON_GROUPS, SubjectIconCategoryId, SubjectIconDefinition, } from '../constants/subjectIconMap';
import { SubjectIconId } from '../constants/subjectIconAssets';
import { fonts, radii, spacing, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';
import { SubjectIconImage } from './SubjectIconImage';

interface SubjectIconPickerModalProps {
  visible: boolean;
  selectedIconId: SubjectIconId;
  onClose: () => void;
  onSelect: (iconId: SubjectIconId) => void;
}

export function SubjectIconPickerModal({
  visible,
  selectedIconId,
  onClose,
  onSelect,
}: SubjectIconPickerModalProps) {
  const { colors, styles } = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | SubjectIconCategoryId>('all');

  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => {
      setQuery('');
      setCategory('all');
    }, 0);
    return () => clearTimeout(timeout);
  }, [visible]);

  const filteredIcons = useMemo(
    () =>
      filterSubjectIcons(query).filter(
        (item) => category === 'all' || item.category === category,
      ),
    [category, query],
  );

  const renderIcon = ({ item }: { item: SubjectIconDefinition }) => {
    const selected = item.id === selectedIconId;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Select ${item.label} icon`}
        accessibilityState={{ selected }}
        onPress={() => onSelect(item.id)}
        style={({ pressed }) => [
          styles.iconTile,
          selected && styles.iconTileSelected,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.iconImageWrap}>
          <SubjectIconImage iconId={item.id} size={58} />
          {selected ? (
            <View style={styles.check}>
              <MaterialCommunityIcons
                name="check"
                color={colors.background}
                size={12}
              />
            </View>
          ) : null}
        </View>
        <Text style={styles.iconLabel} numberOfLines={2}>
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, spacing.md) },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Choose subject icon</Text>
            <Text style={styles.subtitle}>
              Search 125 subjects across five curated categories.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close icon picker"
            onPress={onClose}
            style={styles.close}
          >
            <MaterialCommunityIcons name="close" color={colors.text} size={21} />
          </Pressable>
        </View>

        <View style={styles.search}>
          <MaterialCommunityIcons
            name="magnify"
            color={colors.muted}
            size={21}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search e.g. DBMS, Accounts, Physics"
            placeholderTextColor={colors.faint}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {query ? (
            <Pressable
              accessibilityLabel="Clear icon search"
              onPress={() => setQuery('')}
            >
              <MaterialCommunityIcons
                name="close-circle"
                color={colors.muted}
                size={18}
              />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {[
            { id: 'all' as const, label: 'All' },
            ...SUBJECT_ICON_GROUPS.map((group) => ({
              id: group.id,
              label: group.label.split(',')[0],
            })),
          ].map((item) => {
            const active = category === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setCategory(item.id)}
                style={[
                  styles.categoryChip,
                  active && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultRow}>
          <Text style={styles.resultCount}>
            {filteredIcons.length} icon{filteredIcons.length === 1 ? '' : 's'}
          </Text>
          <Text style={styles.manualHint}>Manual choice stays selected</Text>
        </View>

        <FlatList
          data={filteredIcons}
          keyExtractor={(item) => item.id}
          renderItem={renderIcon}
          numColumns={4}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.iconRow}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="book-search-outline"
                color={colors.muted}
                size={36}
              />
              <Text style={styles.emptyTitle}>No matching icon</Text>
              <Text style={styles.emptyCopy}>
                Try the full subject name or clear search to browse all categories.
              </Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 21,
  },
  subtitle: {
    marginTop: 3,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  close: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 46,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  categories: {
    paddingTop: 10,
    paddingBottom: 2,
    gap: 7,
  },
  categoryChip: {
    minHeight: 32,
    paddingHorizontal: 11,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    borderColor: colors.blue,
    backgroundColor: colors.blueSoft,
  },
  categoryText: {
    color: colors.muted,
    fontFamily: fonts.semiBold,
    fontSize: 8.5,
  },
  categoryTextActive: {
    color: colors.blue,
  },
  resultRow: {
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultCount: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  manualHint: {
    color: colors.cyan,
    fontFamily: fonts.medium,
    fontSize: 9,
  },
  listContent: {
    flexGrow: 1,
  },
  iconRow: {
    gap: 8,
    marginBottom: 8,
  },
  iconTile: {
    flex: 1,
    minWidth: 0,
    minHeight: 106,
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  iconTileSelected: {
    borderColor: colors.lime,
    backgroundColor: `${colors.lime}12`,
  },
  iconImageWrap: {
    position: 'relative',
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    marginTop: 4,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    lineHeight: 11,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  emptyCopy: {
    marginTop: 4,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
