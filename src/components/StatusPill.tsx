import { StyleSheet, Text, View } from 'react-native';

import { fonts, radii } from '../constants/theme';
import { ColorBand } from '../types';

interface StatusPillProps {
  band: ColorBand;
  compact?: boolean;
}

export function StatusPill({ band, compact = false }: StatusPillProps) {
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: `${band.color}22`, borderColor: `${band.color}66` },
        compact && styles.compact,
      ]}
    >
      <Text style={[styles.text, { color: band.color }, compact && styles.compactText]}>
        {band.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  compact: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  compactText: {
    fontSize: 7.5,
  },
});
