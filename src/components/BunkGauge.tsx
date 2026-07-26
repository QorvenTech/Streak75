import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

import { fonts, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';

interface BunkGaugeProps {
  percentage: number;
  target: number;
  headline: string;
  value: number | string;
  valueLabel: string;
}

export function BunkGauge({
  percentage,
  target,
  headline,
  value,
  valueLabel,
}: BunkGaugeProps) {
  const { colors, styles } = useThemedStyles(createStyles);
  const safePercentage = Math.max(0, Math.min(100, percentage));
  const size = 158;
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const offset = circumference * (1 - safePercentage / 100);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.ring, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="bunk-gradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.gradientStart} />
              <Stop offset="0.55" stopColor={colors.gradientEnd} />
              <Stop offset="1" stopColor={colors.gradientMiddle} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.surfaceSoft}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            origin={`${size / 2}, ${size / 2}`}
            rotation="-90"
            stroke="url(#bunk-gradient)"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.percentage}>{safePercentage.toFixed(1)}%</Text>
          <Text style={styles.currentLabel}>Current attendance</Text>
        </View>
      </View>

      <View style={styles.result}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.valueLabel}>{valueLabel}</Text>
        <View style={styles.targetPill}>
          <Text style={styles.targetText}>Target {target}%</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  wrapper: {
    width: '100%',
    minHeight: 176,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 12,
  },
  ring: {
    position: 'relative',
  },
  ringCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    color: colors.purple,
    fontFamily: fonts.bold,
    fontSize: 25,
    letterSpacing: -1,
  },
  currentLabel: {
    marginTop: 1,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  result: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headline: {
    color: colors.success,
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  value: {
    marginTop: -2,
    color: colors.success,
    fontFamily: fonts.bold,
    fontSize: 42,
    lineHeight: 46,
  },
  valueLabel: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  targetPill: {
    marginTop: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.blueSoft,
  },
  targetText: {
    color: colors.blue,
    fontFamily: fonts.semiBold,
    fontSize: 8.5,
  },
});
