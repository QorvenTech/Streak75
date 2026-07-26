import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, onBack, right }: PageHeaderProps) {
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={onBack}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="arrow-left" color={colors.text} size={23} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  header: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: 54,
    alignItems: 'flex-start',
  },
  right: {
    alignItems: 'flex-end',
  },
  back: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  subtitle: {
    marginTop: -1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  pressed: {
    opacity: 0.6,
  },
});
