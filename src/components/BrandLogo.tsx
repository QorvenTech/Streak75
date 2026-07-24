import Svg, { Path, Text as SvgText } from 'react-native-svg';

import { colors } from '../constants/theme';

interface BrandLogoProps {
  size?: number;
}

export function BrandLogo({ size = 42 }: BrandLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 112">
      <Path
        d="M50 5 91 19v36c0 26-15 43-41 54C24 98 9 81 9 55V19L50 5Z"
        fill={colors.backgroundElevated}
        stroke={colors.lime}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <Path
        d="M50 5 91 19v36c0 26-15 43-41 54"
        fill="none"
        stroke={colors.cyan}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <Path
        d="m29 82 13 12 29-34"
        fill="none"
        stroke={colors.lime}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <SvgText
        x="50"
        y="63"
        fill={colors.white}
        fontSize="35"
        fontWeight="800"
        textAnchor="middle"
      >
        75
      </SvgText>
    </Svg>
  );
}
