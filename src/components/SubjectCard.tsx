import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, radii, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';
import {
  CardAppearancePreferences,
  ColorBand,
  Subject,
} from '../types';
import { roundedAttendance } from '../utils/attendance';
import { StatusPill } from './StatusPill';
import { SubjectIconImage } from './SubjectIconImage';

interface SubjectCardProps {
  subject: Subject;
  band: ColorBand;
  onPress?: () => void;
  preview?: boolean;
  appearance?: CardAppearancePreferences;
  onPresent?: () => void;
  onAbsent?: () => void;
}

const defaultAppearance: CardAppearancePreferences = {
  percentageColorMode: 'white',
  subjectNameColorMode: 'white',
};

export function SubjectCard({
  subject,
  band,
  onPress,
  preview = false,
  appearance = defaultAppearance,
  onPresent,
  onAbsent,
}: SubjectCardProps) {
  const { colors, styles } = useThemedStyles(createStyles);
  const percentage = roundedAttendance(subject.classesAttended, subject.classesHeld);
  const percentageColor =
    appearance.percentageColorMode === 'band' ? band.color : colors.text;
  const subjectNameColor =
    appearance.subjectNameColorMode === 'subject'
      ? subject.color
      : appearance.subjectNameColorMode === 'band'
        ? band.color
        : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${subject.name}, ${percentage} percent, ${band.label}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        preview && styles.preview,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { borderColor: `${subject.color}88` }]}>
        <SubjectIconImage
          iconId={subject.iconId}
          legacyIcon={subject.icon}
          fallbackColor={subject.color}
          size={30}
        />
      </View>
      <View style={styles.copy}>
        <Text
          style={[styles.name, { color: subjectNameColor }]}
          numberOfLines={1}
        >
          {subject.name}
        </Text>
        {subject.professor ? (
          <Text style={styles.professor} numberOfLines={1}>
            {subject.professor}
          </Text>
        ) : (
          <Text style={styles.professor}>No professor added</Text>
        )}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(0, Math.min(100, percentage))}%`,
                backgroundColor: subject.color,
              },
            ]}
          />
        </View>
      </View>
      <View style={styles.score}>
        <Text style={[styles.percentage, { color: percentageColor }]}>
          {percentage}%
        </Text>
        {onPresent && onAbsent ? (
          <View style={styles.rowActions}>
            <Pressable
              accessibilityLabel={`Mark ${subject.name} present`}
              hitSlop={4}
              onPress={(event) => {
                event.stopPropagation();
                onPresent();
              }}
              style={[styles.rowAction, { borderColor: colors.success }]}
            >
              <MaterialCommunityIcons
                name="check"
                color={colors.success}
                size={13}
              />
            </Pressable>
            <Pressable
              accessibilityLabel={`Mark ${subject.name} absent`}
              hitSlop={4}
              onPress={(event) => {
                event.stopPropagation();
                onAbsent();
              }}
              style={[styles.rowAction, { borderColor: colors.danger }]}
            >
              <MaterialCommunityIcons
                name="close"
                color={colors.danger}
                size={13}
              />
            </Pressable>
          </View>
        ) : (
          <StatusPill band={band} compact />
        )}
      </View>
      {onPress ? (
        <MaterialCommunityIcons name="chevron-right" color={colors.cyan} size={20} />
      ) : null}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    minHeight: 66,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  preview: {
    minHeight: 68,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.995 }],
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 11,
    borderWidth: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  professor: {
    marginTop: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  progressTrack: {
    height: 3,
    marginTop: 5,
    borderRadius: radii.pill,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSoft,
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  score: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 4,
  },
  rowAction: {
    width: 29,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
