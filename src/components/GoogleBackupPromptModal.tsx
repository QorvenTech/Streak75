import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Modal, Pressable, StyleSheet, Text, View, } from 'react-native';

import { fonts, radii, ThemeColors } from '../constants/theme';
import { useThemedStyles } from '../theme/useThemedStyles';
import { useGoogleAccountLink } from '../hooks/useGoogleAccountLink';
import { useApp } from '../store/AppProvider';
import { shouldShowGoogleBackupPrompt } from '../utils/googleBackupPrompt';

export function GoogleBackupPromptModal() {
  const { colors, styles } = useThemedStyles(createStyles);
  const {
    hydrated,
    profile,
    googleBackupPrompt,
    markGoogleBackupPromptShown,
  } = useApp();
  const { googleLinkBusy, linkGoogleAccount } = useGoogleAccountLink();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      !hydrated ||
      !shouldShowGoogleBackupPrompt(googleBackupPrompt, profile.authMode)
    ) {
      return;
    }
    const timeout = setTimeout(() => {
      markGoogleBackupPromptShown();
      setVisible(true);
    }, 350);
    return () => clearTimeout(timeout);
  }, [
    googleBackupPrompt,
    hydrated,
    markGoogleBackupPromptShown,
    profile.authMode,
  ]);

  const close = () => {
    if (!googleLinkBusy) setVisible(false);
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="cloud-lock-outline"
              color={colors.lime}
              size={30}
            />
          </View>
          <Text style={styles.title}>Protect your attendance</Text>
          <Text style={styles.body}>
            Your classes are already backed up to a temporary anonymous cloud
            account. Connect Google so you can restore them if you change phones,
            reinstall the app, or lose this device.
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={googleLinkBusy}
            onPress={async () => {
              const result = await linkGoogleAccount();
              if (result) setVisible(false);
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            {googleLinkBusy ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="google"
                  color={colors.background}
                  size={19}
                />
                <Text style={styles.primaryText}>Sign in with Google</Text>
              </>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={googleLinkBusy}
            onPress={close}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryText}>Maybe later</Text>
          </Pressable>
          <Text style={styles.footnote}>
            You can connect anytime from Profile → Backup &amp; sync.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '100%',
    maxWidth: 430,
    padding: 22,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
  },
  iconWrap: {
    width: 62,
    height: 62,
    marginBottom: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${colors.lime}66`,
    backgroundColor: `${colors.lime}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 21,
    textAlign: 'center',
  },
  body: {
    marginTop: 9,
    marginBottom: 20,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    minHeight: 50,
    borderRadius: radii.md,
    backgroundColor: colors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryText: {
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  secondaryButton: {
    minHeight: 42,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.cyan,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  footnote: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
