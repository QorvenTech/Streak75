import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;

const sharedColors = {
  brandBlue: '#175CFF',
  brandTeal: '#10BFA8',
  brandPurple: '#7C3AED',
  success: '#16B86A',
  warning: '#F59E0B',
  orange: '#F97316',
  danger: '#EF4444',
  note: '#F5C542',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export const lightColors = {
  ...sharedColors,
  background: '#F7F9FE',
  backgroundElevated: '#F1F5FC',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSoft: '#EEF3FB',
  border: '#DDE5F2',
  borderStrong: '#CBD7E8',
  text: '#071B59',
  textSecondary: '#30416F',
  muted: '#7482A3',
  faint: '#A5AFC3',
  lime: sharedColors.brandBlue,
  limeDark: '#1048D6',
  cyan: '#0EA5E9',
  blue: sharedColors.brandBlue,
  purple: sharedColors.brandPurple,
  absent: '#FEE7E9',
  holiday: '#8795AB',
  overlay: 'rgba(5, 18, 50, 0.45)',
  statusBar: 'dark' as const,
  cardShadow: 'rgba(29, 56, 115, 0.12)',
  gradientStart: '#175CFF',
  gradientMiddle: '#12BFA8',
  gradientEnd: '#7C3AED',
  purpleSoft: '#F1EAFF',
  greenSoft: '#E4F8EE',
  blueSoft: '#E8F0FF',
  orangeSoft: '#FFF2DE',
  redSoft: '#FFE8EA',
} as const;

export const darkColors = {
  ...sharedColors,
  background: '#030B17',
  backgroundElevated: '#06101D',
  surface: '#081522',
  surfaceRaised: '#0B1A29',
  surfaceSoft: '#102234',
  border: '#203246',
  borderStrong: '#2D435B',
  text: '#F8FAFF',
  textSecondary: '#C6D0E0',
  muted: '#8998AF',
  faint: '#5B6A80',
  lime: '#3478FF',
  limeDark: '#1B58DB',
  cyan: '#22B8F0',
  blue: '#3478FF',
  purple: '#9A5BFF',
  absent: '#4A2029',
  holiday: '#9AA8BC',
  overlay: 'rgba(0, 5, 13, 0.78)',
  statusBar: 'light' as const,
  cardShadow: 'rgba(0, 0, 0, 0.42)',
  gradientStart: '#3478FF',
  gradientMiddle: '#12C9A7',
  gradientEnd: '#9A5BFF',
  purpleSoft: '#251A42',
  greenSoft: '#0D382A',
  blueSoft: '#102A52',
  orangeSoft: '#3B2912',
  redSoft: '#3D1C24',
} as const;

export type ThemeColors = {
  [Key in keyof typeof lightColors]: string;
};

export interface AppTheme {
  mode: ResolvedThemeMode;
  dark: boolean;
  colors: ThemeColors;
}

export const lightTheme: AppTheme = {
  mode: 'light',
  dark: false,
  colors: lightColors,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  dark: true,
  colors: darkColors,
};

/**
 * Kept only for non-visual metadata modules. Components and screens must read
 * colors from ThemeProvider so the appearance can update without an app reload.
 */
export const colors = darkColors;

export const fonts = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semiBold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
} as const;

export function createCardShadow(colors: ThemeColors, dark: boolean) {
  return Platform.select({
    ios: {
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: dark ? 8 : 5 },
      shadowOpacity: dark ? 0.32 : 0.18,
      shadowRadius: dark ? 16 : 12,
    },
    android: {
      elevation: dark ? 4 : 3,
    },
    default: {},
  });
}
