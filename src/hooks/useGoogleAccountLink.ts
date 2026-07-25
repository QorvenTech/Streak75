import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import {
  GoogleLinkResult,
  isCloudConfigured,
  linkAnonymousUserWithGoogle,
  readableCloudError,
  syncAllToCloud,
  waitForCloudSync,
} from '../services/cloud';
import { useApp } from '../store/AppProvider';

export function useGoogleAccountLink() {
  const app = useApp();
  const { profile, updateProfile } = app;
  const [googleLinkBusy, setGoogleLinkBusy] = useState(false);

  const linkGoogleAccount = useCallback(async (): Promise<
    GoogleLinkResult | undefined
  > => {
    if (profile.authMode === 'signed-in') {
      Alert.alert(
        'Google account connected',
        profile.email
          ? `${profile.email} is already protecting your attendance across devices.`
          : 'Your Google account is already connected.',
      );
      return undefined;
    }
    if (!isCloudConfigured()) {
      Alert.alert(
        'Firebase setup required',
        'Add the Firebase service file for this platform and create a new development build.',
      );
      return undefined;
    }

    setGoogleLinkBusy(true);
    try {
      if (profile.uid) {
        await syncAllToCloud(profile.uid, app);
        await waitForCloudSync();
      }
      const result = await linkAnonymousUserWithGoogle();
      if (result.outcome !== 'existing-account') {
        updateProfile({
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          authMode: 'signed-in',
          syncStatus: 'syncing',
        });
      }

      if (result.outcome === 'existing-account') {
        Alert.alert(
          'Existing Streak75 account activated',
          'This Google account was already connected on another device. Its existing cloud attendance is now active and is being loaded. This phone’s temporary anonymous data was not mixed into that account; a safety copy was retained on this device.',
        );
      } else {
        Alert.alert(
          'Google backup connected',
          'Your anonymous Streak75 account was upgraded without changing its UID, so all existing attendance stays exactly where it is and can now be restored on another device.',
        );
      }
      return result;
    } catch (error) {
      Alert.alert('Google backup', readableCloudError(error));
      return undefined;
    } finally {
      setGoogleLinkBusy(false);
    }
  }, [app, profile.authMode, profile.email, profile.uid, updateProfile]);

  return { googleLinkBusy, linkGoogleAccount };
}
