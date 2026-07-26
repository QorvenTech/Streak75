import { useMemo } from 'react';

import { ThemeColors } from '../constants/theme';
import { useAppTheme } from './ThemeProvider';

export function useThemedStyles<T>(
  factory: (colors: ThemeColors, dark: boolean) => T,
) {
  const { theme } = useAppTheme();
  const styles = useMemo(
    () => factory(theme.colors, theme.dark),
    [factory, theme],
  );
  return { colors: theme.colors, dark: theme.dark, styles };
}
