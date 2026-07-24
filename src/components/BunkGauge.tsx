import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { colors, fonts } from '../constants/theme';

interface BunkGaugeProps {
  percentage: number;
  target: number;
  headline: string;
  value: number | string;
  valueLabel: string;
}

const gaugeColors = [
  '#53D64A',
  '#6DDB38',
  '#8DDF25',
  '#B5E31C',
  '#DCE31A',
  '#F5D51D',
  '#F8B41A',
  '#FA8D19',
  '#F76822',
  '#F04444',
];

const polar = (cx: number, cy: number, radius: number, angle: number) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
};

const arc = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polar(cx, cy, radius, startAngle);
  const end = polar(cx, cy, radius, endAngle);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
};

export function BunkGauge({
  percentage,
  target,
  headline,
  value,
  valueLabel,
}: BunkGaugeProps) {
  const safePercentage = Math.max(0, Math.min(100, percentage));
  const width = 330;
  const height = 197;
  const cx = width / 2;
  const cy = 164;
  const radius = 135;
  const segmentCount = 30;
  const needleAngle = 180 + safePercentage * 1.8;
  const needleEnd = polar(cx, cy, radius - 30, needleAngle);
  const targetAngle = 180 + Math.max(0, Math.min(100, target)) * 1.8;
  const targetInner = polar(cx, cy, radius - 12, targetAngle);
  const targetOuter = polar(cx, cy, radius + 11, targetAngle);

  return (
    <View style={styles.wrapper}>
      <Svg width={width} height={height}>
        {Array.from({ length: segmentCount }, (_, index) => {
          const start = 180 + (index / segmentCount) * 180 + 0.8;
          const end = 180 + ((index + 1) / segmentCount) * 180 - 0.8;
          const colorIndex = Math.min(
            gaugeColors.length - 1,
            Math.floor((index / segmentCount) * gaugeColors.length),
          );
          return (
            <Path
              key={index}
              d={arc(cx, cy, radius, start, end)}
              stroke={gaugeColors[colorIndex]}
              strokeWidth={15}
              strokeLinecap="butt"
              fill="none"
              opacity={index / segmentCount <= safePercentage / 100 ? 1 : 0.27}
            />
          );
        })}
        <Line
          x1={targetInner.x}
          y1={targetInner.y}
          x2={targetOuter.x}
          y2={targetOuter.y}
          stroke={colors.white}
          strokeWidth={3}
        />
        <Line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke={colors.white}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Circle cx={cx} cy={cy} r={10} fill={colors.text} />
        <Circle cx={cx} cy={cy} r={4} fill={colors.faint} />
      </Svg>
      <Text style={styles.zero}>0%</Text>
      <Text style={styles.hundred}>100%</Text>
      <Text style={[styles.target, { left: `${Math.max(8, Math.min(80, target - 9))}%` }]}>
        {target}% target
      </Text>
      <View style={styles.valueBlock}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.valueLabel}>{valueLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 330,
    height: 198,
    alignSelf: 'center',
  },
  zero: {
    position: 'absolute',
    left: 8,
    bottom: 18,
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  hundred: {
    position: 'absolute',
    right: 1,
    bottom: 18,
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  target: {
    position: 'absolute',
    top: 4,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 8,
  },
  valueBlock: {
    position: 'absolute',
    left: 75,
    right: 75,
    bottom: 13,
    alignItems: 'center',
  },
  headline: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 46,
    lineHeight: 49,
    letterSpacing: -2,
  },
  valueLabel: {
    marginTop: -3,
    color: colors.lime,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
