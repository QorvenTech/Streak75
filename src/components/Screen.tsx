import { PropsWithChildren } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollProps?: ScrollViewProps;
}

export function Screen({
  children,
  scroll = true,
  contentContainerStyle,
  scrollProps,
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
});
