import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '../constants/theme';
import { BrandLogo } from './BrandLogo';

interface AppHeaderProps {
  onNotificationsPress?: () => void;
}

export function AppHeader({ onNotificationsPress }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <BrandLogo size={38} />
        <View>
          <Text style={styles.wordmark}>
            Streak<Text style={styles.accent}>75</Text>
          </Text>
          <Text style={styles.tagline}>HIT 75. STAY AHEAD.</Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open notifications"
        hitSlop={10}
        onPress={onNotificationsPress}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="bell-outline" size={23} color={colors.text} />
        <View style={styles.notificationDot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordmark: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 21,
    letterSpacing: -0.8,
  },
  accent: {
    color: colors.lime,
  },
  tagline: {
    marginTop: -1,
    color: colors.cyan,
    fontFamily: fonts.semiBold,
    fontSize: 7.5,
    letterSpacing: 1.2,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  notificationDot: {
    position: 'absolute',
    right: 9,
    top: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
  },
  pressed: {
    opacity: 0.7,
  },
});
