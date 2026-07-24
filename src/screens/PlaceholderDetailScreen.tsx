import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { colors, fonts } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'SubjectDetail' | 'ColorCustomization'
>;

export function PlaceholderDetailScreen({ navigation, route }: Props) {
  const custom = route.name === 'ColorCustomization';
  return (
    <Screen scroll={false} contentContainerStyle={styles.container}>
      <Pressable onPress={navigation.goBack} style={styles.back}>
        <MaterialCommunityIcons name="arrow-left" color={colors.text} size={22} />
      </Pressable>
      <View style={styles.center}>
        <MaterialCommunityIcons
          name={custom ? 'palette-outline' : 'book-open-variant'}
          color={colors.lime}
          size={46}
        />
        <Text style={styles.title}>
          {custom ? 'Color customization' : 'Subject detail'}
        </Text>
        <Text style={styles.subtitle}>
          {custom
            ? 'Your global attendance bands and live preview.'
            : 'Calendar history, notes, and subject exports.'}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  back: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 16,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 24,
  },
  subtitle: {
    marginTop: 6,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: 'center',
  },
});
