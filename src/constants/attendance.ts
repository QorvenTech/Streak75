import { colors } from './theme';
import { AttendanceStatus } from '../types';

export const STATUS_META: Record<
  AttendanceStatus,
  { label: string; color: string; icon: string }
> = {
  present: {
    label: 'Present',
    color: colors.success,
    icon: 'check-circle-outline',
  },
  absent: {
    label: 'Absent',
    color: colors.danger,
    icon: 'close-circle-outline',
  },
  leave: {
    label: 'Leave',
    color: colors.cyan,
    icon: 'calendar-account-outline',
  },
  holiday: {
    label: 'Holiday',
    color: colors.holiday,
    icon: 'palm-tree',
  },
  'no-class': {
    label: 'No class',
    color: colors.faint,
    icon: 'minus-circle-outline',
  },
};
