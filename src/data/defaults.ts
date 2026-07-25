import { ColorBand, PersistedAppState, Subject, UserSettings } from '../types';
import { suggestSubjectIcon } from '../constants/subjectIconMap';
import { toDateKey } from '../utils/dates';
import { recordTotals } from '../utils/records';

export const DEFAULT_COLOR_BANDS: ColorBand[] = [
  { id: 'excellent', label: 'Excellent', minimum: 85, color: '#65D83A' },
  { id: 'good', label: 'Good', minimum: 70, color: '#3F92F1' },
  { id: 'at-risk', label: 'At Risk', minimum: 60, color: '#F4B81F' },
  { id: 'danger', label: 'Danger', minimum: 0, color: '#F04444' },
];

export const DEFAULT_SETTINGS: UserSettings = {
  targetPercentage: 75,
  colorBands: DEFAULT_COLOR_BANDS,
  notifications: {
    dailyReminderEnabled: true,
    reminderTime: '07:30',
    lowAttendanceAlertEnabled: true,
  },
  cardAppearance: {
    percentageColorMode: 'white',
    subjectNameColorMode: 'white',
  },
  applyBandsGlobally: true,
};

const subject = (
  id: string,
  name: string,
  professor: string,
  icon: string,
  color: string,
  classesAttended: number,
  classesHeld: number,
  favorite = false,
): Subject => {
  const records = makeMonthRecords(id);
  const dated = recordTotals(records);
  const openingClassesAttended = Math.max(
    0,
    classesAttended - dated.attended,
  );
  const openingClassesHeld = Math.max(
    openingClassesAttended,
    classesHeld - dated.held,
  );
  return {
    id,
    name,
    professor,
    iconId: suggestSubjectIcon(name).id,
    iconSelectionSource: 'auto',
    icon,
    color,
    favorite,
    openingClassesAttended,
    openingClassesHeld,
    classesAttended,
    classesHeld,
    records,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

function makeMonthRecords(seed: string): Subject['records'] {
  const now = new Date();
  const statuses: Subject['records'][string]['status'][] = [
    'present',
    'present',
    'absent',
    'present',
    'holiday',
    'present',
    'present',
    'leave',
    'present',
    'present',
    'no-class',
    'present',
    'absent',
    'present',
  ];
  const records: Subject['records'] = {};
  const offset = seed.length % 4;
  const maxDay = Math.min(now.getDate(), 21);

  for (let day = 1; day <= maxDay; day += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    if (date.getDay() === 0) continue;
    const status = statuses[(day + offset) % statuses.length] ?? 'present';
    const key = toDateKey(date);
    records[key] = {
      date: key,
      status,
      updatedAt: new Date().toISOString(),
      ...(day === 10 && seed === 'economics'
        ? { note: 'Assignment discussion — important concepts covered in class.' }
        : {}),
      ...(day === 17 && seed === 'economics'
        ? { note: 'Short test: syllabus Unit 2 and Unit 3.' }
        : {}),
    };
  }
  return records;
}

export const createInitialState = (): PersistedAppState => ({
  subjects:
    typeof __DEV__ !== 'undefined' && __DEV__
      ? [
          subject(
            'economics',
            'Economics',
            'Prof. Mehta',
            'book-open-variant',
            '#65D83A',
            43,
            50,
            true,
          ),
          subject(
            'taxation',
            'Taxation',
            'Prof. Sharma',
            'calculator-variant',
            '#F4D93F',
            37,
            50,
          ),
          subject(
            'management-accounting',
            'Management Accounting',
            'Prof. Iyer',
            'chart-line',
            '#4DD66E',
            46,
            50,
          ),
          subject(
            'marketing',
            'Marketing',
            'Prof. Kapoor',
            'bullhorn-outline',
            '#FF7043',
            34,
            50,
          ),
          subject(
            'sociology',
            'Sociology',
            'Prof. Das',
            'account-group-outline',
            '#35C5F0',
            39,
            48,
          ),
          subject(
            'java',
            'Java Programming',
            'Prof. Nair',
            'laptop',
            '#47D98B',
            45,
            50,
          ),
          subject(
            'business-law',
            'Business Law',
            'Prof. Singh',
            'scale-balance',
            '#8B7CF6',
            38,
            49,
          ),
        ]
      : [],
  settings: DEFAULT_SETTINGS,
  profile: {
    uid: null,
    displayName: 'Student',
    email: null,
    photoURL: null,
    authMode: 'local',
    syncStatus: 'local-only',
    lastSyncedAt: null,
  },
  googleBackupPrompt: {
    usageDates: [toDateKey(new Date())],
    subjectsAddedCount: 0,
    autoPromptShownAt: null,
  },
  selectedSubjectId:
    typeof __DEV__ !== 'undefined' && __DEV__ ? 'economics' : null,
});
