import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, fonts } from '../constants/theme';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  valueColor?: string;
  label?: string;
}

export function CircularProgress({
  percentage,
  size = 116,
  strokeWidth = 10,
  color = colors.lime,
  valueColor = colors.text,
  label,
}: CircularProgressProps) {
  const safePercentage = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const dashOffset = circumference - (safePercentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceSoft}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <View style={styles.percentRow}>
          <Text
            style={[
              styles.value,
              { color: valueColor },
              size < 100 && styles.smallValue,
            ]}
          >
            {Math.round(safePercentage)}
          </Text>
          <Text
            style={[
              styles.symbol,
              { color: valueColor },
              size < 100 && styles.smallSymbol,
            ]}
          >
            %
          </Text>
        </View>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 30,
    letterSpacing: -1.5,
  },
  symbol: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  smallValue: {
    fontSize: 23,
  },
  smallSymbol: {
    fontSize: 11,
  },
  label: {
    marginTop: -3,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 9,
  },
});
