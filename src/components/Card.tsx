import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { createCardShadow, radii, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  const { styles } = useThemedStyles(createStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

const createStyles = (colors: ThemeColors, dark: boolean) => StyleSheet.create({
  card: {
    ...createCardShadow(colors, dark),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
