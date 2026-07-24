import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image, StyleSheet, View } from 'react-native';

import { SUBJECT_ICON_ASSETS } from '../constants/subjectIconAssets';
import { getSubjectIcon } from '../constants/subjectIconMap';

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
  fallbackColor = '#65D83A',
}: SubjectIconImageProps) {
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
  return (
    <Image
      accessibilityIgnoresInvertColors
      source={SUBJECT_ICON_ASSETS[definition.id]}
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
