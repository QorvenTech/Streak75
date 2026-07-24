import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { colors, fonts } from '../constants/theme';

interface PlaceholderTabScreenProps {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export function PlaceholderTabScreen({
  title,
  subtitle,
  icon,
}: PlaceholderTabScreenProps) {
  return (
    <Screen scroll={false} contentContainerStyle={styles.container}>
      <View style={styles.icon}>
        <MaterialCommunityIcons name={icon} color={colors.lime} size={42} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  icon: {
    width: 82,
    height: 82,
    marginBottom: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 24,
  },
  subtitle: {
    maxWidth: 290,
    marginTop: 7,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
