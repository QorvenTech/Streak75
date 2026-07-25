import { Platform } from 'react-native';

export const colors = {
  background: '#020B18',
  backgroundElevated: '#071322',
  surface: '#091827',
  surfaceRaised: '#0D2032',
  surfaceSoft: '#10263A',
  border: '#173248',
  borderStrong: '#21465F',
  text: '#F7FAFC',
  textSecondary: '#C5D0DC',
  muted: '#8293A5',
  faint: '#53677B',
  lime: '#B6F20C',
  limeDark: '#6FAB0A',
  cyan: '#35C5F0',
  success: '#65D83A',
  blue: '#4EA9F5',
  purple: '#A86AF5',
  warning: '#F4B81F',
  orange: '#FF7A1A',
  danger: '#F04444',
  absent: '#5C2632',
  holiday: '#94A3B8',
  note: '#FFD633',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 5, 13, 0.76)',
} as const;

export const fonts = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semiBold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
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

export const shadows = Platform.select({
  ios: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
  },
  android: {
    elevation: 6,
  },
  default: {},
});
