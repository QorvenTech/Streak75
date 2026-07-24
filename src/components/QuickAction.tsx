import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radii } from '../constants/theme';

interface QuickActionProps {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  onPress: () => void;
}

export function QuickAction({ label, icon, color, onPress }: QuickActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: `${color}55`, backgroundColor: `${color}13` },
        pressed && styles.pressed,
      ]}
    >
      <MaterialCommunityIcons name={icon} color={color} size={25} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 70,
    minHeight: 68,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
});
