import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, radii, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';

interface SettingsRowProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
}

export function SettingsRow({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  right,
}: SettingsRowProps) {
  const { colors, styles } = useThemedStyles(createStyles);
  const resolvedIconColor = iconColor ?? colors.blue;
  const content = (
    <>
      <View
        style={[
          styles.icon,
          { backgroundColor: `${resolvedIconColor}18` },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          color={resolvedIconColor}
          size={21}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ??
        (onPress ? (
          <MaterialCommunityIcons name="chevron-right" color={colors.muted} size={21} />
        ) : null)}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    minHeight: 68,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  icon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  subtitle: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 13,
  },
  pressed: {
    opacity: 0.65,
  },
});
