import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';

import { useApp } from '../store/AppProvider';
import { PersistedAppState } from '../types';
import {
  consumeExistingAccountSwitch,
  ensureAnonymousSession,
  isCloudConfigured,
  pullFromCloud,
  subscribeToAuth,
  syncAllToCloud,
  waitForCloudSync,
} from './cloud';
import {
  activateExistingCloudAccount,
  mergeCloudState,
} from './merge';
import { scheduleDailyReminder } from './notifications';

export function CloudSyncBridge() {
  const app = useApp();
  const { updateProfile, replaceFromCloud } = app;
  const latest = useRef<PersistedAppState>(app);
  const authRun = useRef(0);

  useEffect(() => {
    latest.current = app;
  }, [app]);

  useEffect(() => {
    scheduleDailyReminder(app.settings.notifications).catch(() => undefined);
  }, [app.settings.notifications]);

  useEffect(() => {
    if (!app.hydrated) return;
    const unsubscribeNetwork = NetInfo.addEventListener((network) => {
      if (!network.isConnected) {
        if (latest.current.profile.authMode !== 'local') {
          updateProfile({ syncStatus: 'offline' });
        }
        return;
      }
      if (latest.current.profile.authMode === 'local') {
        if (isCloudConfigured()) {
          ensureAnonymousSession().catch(() =>
            updateProfile({ syncStatus: 'offline' }),
          );
        }
        return;
      }
      updateProfile({ syncStatus: 'syncing' });
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
  }, [app.hydrated, updateProfile]);

  useEffect(() => {
    if (!app.hydrated) return;
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
          ensureAnonymousSession().catch(() =>
            updateProfile({
              uid: null,
              authMode: 'local',
              syncStatus: 'offline',
              lastSyncedAt: null,
            }),
          );
          return;
        }
        const run = ++authRun.current;
        void (async () => {
          const accountSwitch = await consumeExistingAccountSwitch(user.uid);
          if (accountSwitch) {
            await AsyncStorage.setItem(
              `@streak75/anonymous-account-archive/${accountSwitch.sourceAnonymousUid}`,
              JSON.stringify(latest.current),
            ).catch(() => undefined);
            const cloud = await pullFromCloud(user, { includeEmpty: true });
            if (run !== authRun.current) return;
            replaceFromCloud(
              activateExistingCloudAccount(latest.current, {
                ...cloud,
                profile: {
                  uid: user.uid,
                  displayName: user.displayName,
                  email: user.email,
                  photoURL: user.photoURL,
                  authMode: 'signed-in',
                  syncStatus: 'up-to-date',
                  lastSyncedAt: new Date().toISOString(),
                },
              }),
            );
            return;
          }

          updateProfile({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            authMode: user.isAnonymous ? 'anonymous' : 'signed-in',
            syncStatus: 'syncing',
          });
          const cloud = await pullFromCloud(user);
          if (run !== authRun.current) return;
          const merged = mergeCloudState(
            {
              ...latest.current,
              profile: {
                ...latest.current.profile,
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                authMode: user.isAnonymous ? 'anonymous' : 'signed-in',
                syncStatus: 'syncing',
              },
            },
            cloud,
          );
          replaceFromCloud(merged);
          await syncAllToCloud(user.uid, merged);
          await waitForCloudSync();
          if (run !== authRun.current) return;
          updateProfile({
            syncStatus: 'up-to-date',
            lastSyncedAt: new Date().toISOString(),
          });
        })().catch(() => {
          if (run === authRun.current) {
            updateProfile({ syncStatus: 'offline' });
          }
        });
      },
      () => updateProfile({ syncStatus: 'error' }),
    );
  }, [app.hydrated, replaceFromCloud, updateProfile]);

  return null;
}
