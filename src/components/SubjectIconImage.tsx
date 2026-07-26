import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image, StyleSheet, View } from 'react-native';

import { SUBJECT_ICON_ASSETS } from '../constants/subjectIconAssets';
import { getSubjectIcon } from '../constants/subjectIconMap';
import { useAppTheme } from '../theme/ThemeProvider';

interface SubjectIconImageProps {
  iconId?: string | null;
  legacyIcon?: string;
  size: number;
  fallbackColor?: string;
}

export function SubjectIconImage({
  iconId,
  legacyIcon = 'book-open-variant',
  size,
  fallbackColor = '#175CFF',
}: SubjectIconImageProps) {
  const { theme } = useAppTheme();
  if (!iconId) {
    return (
      <View style={{ width: size, height: size }}>
        <MaterialCommunityIcons
          name={
            legacyIcon as keyof typeof MaterialCommunityIcons.glyphMap
          }
          color={fallbackColor}
          size={size}
        />
      </View>
    );
  }

  const definition = getSubjectIcon(iconId);
  const assetPair = SUBJECT_ICON_ASSETS[definition.id];
  return (
    <Image
      accessibilityIgnoresInvertColors
      source={assetPair[theme.mode]}
      resizeMode="contain"
      style={[styles.image, { width: size, height: size }]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: 'transparent',
  },
});
