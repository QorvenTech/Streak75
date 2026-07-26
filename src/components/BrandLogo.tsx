import Svg, {
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { useAppTheme } from '../theme/ThemeProvider';

interface BrandLogoProps {
  size?: number;
}

export function BrandLogo({ size = 42 }: BrandLogoProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <Svg
      accessibilityLabel="Streak75 logo"
      width={size}
      height={size}
      viewBox="0 0 112 112"
    >
      <Defs>
        <LinearGradient id="brand-ring" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.gradientStart} />
          <Stop offset="0.52" stopColor={colors.gradientMiddle} />
          <Stop offset="1" stopColor={colors.gradientEnd} />
        </LinearGradient>
        <LinearGradient id="brand-number" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={theme.dark ? colors.white : colors.text} />
          <Stop offset="0.62" stopColor={colors.gradientStart} />
          <Stop offset="1" stopColor={colors.gradientEnd} />
        </LinearGradient>
      </Defs>

      <Path
        d="M20 86C7 67 8 42 21 24 36 5 64 1 86 12"
        fill="none"
        stroke="url(#brand-ring)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <G>
        <Path d="M76 31h28l-6 9H73Z" fill={colors.gradientMiddle} />
        <Path d="M79 45h22l-7 9H76Z" fill={colors.gradientStart} />
        <Path d="M76 59h18l-8 9H72Z" fill={colors.gradientEnd} />
      </G>
      <SvgText
        x="54"
        y="78"
        fill="url(#brand-number)"
        fontSize="67"
        fontStyle="italic"
        fontWeight="900"
        textAnchor="middle"
      >
        75
      </SvgText>
    </Svg>
  );
}
