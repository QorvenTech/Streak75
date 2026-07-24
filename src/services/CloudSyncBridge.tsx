import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';

import { useApp } from '../store/AppProvider';
import { PersistedAppState } from '../types';
import {
  isCloudConfigured,
  pullFromCloud,
  subscribeToAuth,
  syncAllToCloud,
  waitForCloudSync,
} from './cloud';
import { mergeCloudState } from './merge';
import { scheduleDailyReminder } from './notifications';

export function CloudSyncBridge() {
  const app = useApp();
  const { updateProfile, replaceFromCloud } = app;
  const latest = useRef<PersistedAppState>(app);

  useEffect(() => {
    latest.current = app;
  }, [app]);

  useEffect(() => {
    scheduleDailyReminder(app.settings.notifications).catch(() => undefined);
  }, [app.settings.notifications]);

  useEffect(() => {
    const unsubscribeNetwork = NetInfo.addEventListener((network) => {
      if (latest.current.profile.authMode !== 'signed-in') return;
        updateProfile({
          syncStatus: network.isConnected ? 'syncing' : 'offline',
        });
      if (network.isConnected && latest.current.profile.uid) {
        syncAllToCloud(latest.current.profile.uid, latest.current)
          .then(() => waitForCloudSync())
          .then(() =>
            updateProfile({
              syncStatus: 'up-to-date',
              lastSyncedAt: new Date().toISOString(),
            }),
          )
          .catch(() => updateProfile({ syncStatus: 'offline' }));
      }
    });
    return unsubscribeNetwork;
  }, [updateProfile]);

  useEffect(() => {
    if (!isCloudConfigured()) {
      updateProfile({
        uid: null,
        authMode: 'local',
        syncStatus: 'local-only',
      });
      return () => undefined;
    }

    return subscribeToAuth(
      (user) => {
        if (!user) {
          updateProfile({
            uid: null,
            authMode: 'local',
            syncStatus: 'local-only',
            lastSyncedAt: null,
          });
          return;
        }
        updateProfile({
          ...user,
          authMode: 'signed-in',
          syncStatus: 'syncing',
        });
        pullFromCloud(user)
          .then((cloud) => {
            const merged = mergeCloudState(
              {
                ...latest.current,
                profile: {
                  ...latest.current.profile,
                  ...user,
                  authMode: 'signed-in',
                  syncStatus: 'syncing',
                },
              },
              cloud,
            );
            replaceFromCloud(merged);
            return syncAllToCloud(user.uid, merged);
          })
          .then(() => waitForCloudSync())
          .then(() =>
            updateProfile({
              syncStatus: 'up-to-date',
              lastSyncedAt: new Date().toISOString(),
            }),
          )
          .catch(() => updateProfile({ syncStatus: 'offline' }));
      },
      () => updateProfile({ syncStatus: 'error' }),
    );
  }, [replaceFromCloud, updateProfile]);

  return null;
}
