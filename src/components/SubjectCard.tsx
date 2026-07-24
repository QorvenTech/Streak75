import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '../constants/theme';
import { ColorBand, Subject } from '../types';
import { roundedAttendance } from '../utils/attendance';
import { StatusPill } from './StatusPill';

interface SubjectCardProps {
  subject: Subject;
  band: ColorBand;
  onPress?: () => void;
  preview?: boolean;
}

export function SubjectCard({ subject, band, onPress, preview = false }: SubjectCardProps) {
  const percentage = roundedAttendance(subject.classesAttended, subject.classesHeld);

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
        <MaterialCommunityIcons
          name={subject.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          color={subject.color}
          size={20}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {subject.name}
        </Text>
        {subject.professor ? (
          <Text style={styles.professor} numberOfLines={1}>
            {subject.professor}
          </Text>
        ) : (
          <Text style={styles.professor}>No professor added</Text>
        )}
      </View>
      <View style={styles.score}>
        <Text style={styles.percentage}>{percentage}%</Text>
        <StatusPill band={band} compact />
      </View>
      {onPress ? (
        <MaterialCommunityIcons name="chevron-right" color={colors.cyan} size={20} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
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
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  professor: {
    marginTop: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  score: {
    alignItems: 'flex-end',
    gap: 2,
  },
  percentage: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
