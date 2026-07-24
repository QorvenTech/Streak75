import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '../constants/theme';

export function ExpoGoTestBanner() {
  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons name="flask-outline" color={colors.warning} size={18} />
      <View style={styles.copy}>
        <Text style={styles.title}>Expo Go test mode</Text>
        <Text style={styles.subtitle}>
          Local features enabled · Google and cloud sync disabled
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 48,
    marginBottom: 9,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: `${colors.warning}55`,
    backgroundColor: `${colors.warning}10`,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.warning,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 1,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 8.5,
  },
});
