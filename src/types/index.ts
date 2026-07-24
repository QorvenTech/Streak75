import type { SubjectIconId } from '../constants/subjectIconAssets';

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'leave'
  | 'holiday'
  | 'no-class';

export interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
  note?: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  professor?: string;
  /**
   * Illustrated icon selected from the subject icon catalog.
   * Optional so locally persisted v1 subjects can be migrated safely.
   */
  iconId?: SubjectIconId;
  iconSelectionSource?: 'auto' | 'manual';
  /**
   * Legacy MaterialCommunityIcons name kept for backward compatibility.
   */
  icon: string;
  color: string;
  favorite: boolean;
  /**
   * Totals that existed before the user started adding dated records.
   * Optional for backward compatibility with locally persisted v1 data.
   */
  openingClassesHeld?: number;
  openingClassesAttended?: number;
  classesHeld: number;
  classesAttended: number;
  records: Record<string, AttendanceRecord>;
  createdAt: string;
  updatedAt: string;
}

export interface ColorBand {
  id: string;
  label: string;
  minimum: number;
  color: string;
}

export interface NotificationPreferences {
  dailyReminderEnabled: boolean;
  reminderTime: string;
  lowAttendanceAlertEnabled: boolean;
}

export interface UserSettings {
  targetPercentage: number;
  colorBands: ColorBand[];
  notifications: NotificationPreferences;
  applyBandsGlobally: boolean;
}

export type AuthMode = 'local' | 'signed-in';
export type SyncStatus = 'local-only' | 'syncing' | 'up-to-date' | 'offline' | 'error';

export interface UserProfile {
  uid: string | null;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  authMode: AuthMode;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
}

export interface PersistedAppState {
  subjects: Subject[];
  settings: UserSettings;
  profile: UserProfile;
  selectedSubjectId: string | null;
}
