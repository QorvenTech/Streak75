import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '../constants/theme';

interface MetricTileProps {
  label: string;
  value: string;
  accent?: string;
}

export function MetricTile({ label, value, accent = colors.text }: MetricTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 69,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    minHeight: 25,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    lineHeight: 11,
    textAlign: 'center',
  },
  value: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
});
