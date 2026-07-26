import { StyleSheet, Text, View } from 'react-native';

import { STATUS_META } from '../constants/attendance';
import { fonts, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';
import { AttendanceStatus } from '../types';

const statuses: AttendanceStatus[] = ['present', 'absent', 'leave', 'holiday'];

export function AttendanceLegend() {
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.legend}>
      {statuses.map((status) => (
        <View key={status} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: STATUS_META[status].color }]} />
          <Text style={styles.label}>{STATUS_META[status].label}</Text>
        </View>
      ))}
      <View style={styles.item}>
        <View style={[styles.dot, { backgroundColor: colors.note }]} />
        <Text style={styles.label}>Note</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  legend: {
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 13,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  label: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 9,
  },
});
