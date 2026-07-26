import { StyleSheet, Text, View } from 'react-native';

import { fonts, radii, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';

interface MetricTileProps {
  label: string;
  value: string;
  accent?: string;
}

export function MetricTile({ label, value, accent }: MetricTileProps) {
  const { colors, styles } = useThemedStyles(createStyles);
  const valueColor = accent ?? colors.text;
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
