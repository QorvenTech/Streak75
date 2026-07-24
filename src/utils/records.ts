import {
  AttendanceRecord,
  AttendanceStatus,
  Subject,
} from '../types';
import { statusContribution } from './attendance';

export interface AttendanceTotals {
  held: number;
  attended: number;
}

const wholeNumber = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;

export function recordTotals(
  records: Subject['records'],
): AttendanceTotals {
  return Object.values(records).reduce<AttendanceTotals>(
    (total, record) => {
      const contribution = statusContribution(record.status);
      return {
        held: total.held + contribution.held,
        attended: total.attended + contribution.attended,
      };
    },
    { held: 0, attended: 0 },
  );
}

export function openingTotals(subject: Subject): AttendanceTotals {
  if (
    typeof subject.openingClassesHeld === 'number' &&
    typeof subject.openingClassesAttended === 'number'
  ) {
    const held = wholeNumber(subject.openingClassesHeld);
    return {
      held,
      attended: Math.min(held, wholeNumber(subject.openingClassesAttended)),
    };
  }

  const dated = recordTotals(subject.records);
  let held = Math.max(0, wholeNumber(subject.classesHeld) - dated.held);
  const attended = Math.max(
    0,
    wholeNumber(subject.classesAttended) - dated.attended,
  );
  held = Math.max(held, attended);
  return { held, attended };
}

export function recalculateSubjectTotals(subject: Subject): Subject {
  const opening = openingTotals(subject);
  const dated = recordTotals(subject.records);
  return {
    ...subject,
    openingClassesHeld: opening.held,
    openingClassesAttended: opening.attended,
    classesHeld: opening.held + dated.held,
    classesAttended: opening.attended + dated.attended,
  };
}

export function saveSubjectRecord(
  subject: Subject,
  date: string,
  status: AttendanceStatus,
  note: string,
  updatedAt = new Date().toISOString(),
): { subject: Subject; record: AttendanceRecord } {
  const normalized = recalculateSubjectTotals(subject);
  const record: AttendanceRecord = {
    date,
    status,
    note: note.trim() || undefined,
    updatedAt,
  };
  return {
    record,
    subject: recalculateSubjectTotals({
      ...normalized,
      records: {
        ...normalized.records,
        [date]: record,
      },
      updatedAt,
    }),
  };
}

export function removeSubjectRecord(
  subject: Subject,
  date: string,
  updatedAt = new Date().toISOString(),
): Subject {
  const normalized = recalculateSubjectTotals(subject);
  if (!normalized.records[date]) return normalized;
  const records = { ...normalized.records };
  delete records[date];
  return recalculateSubjectTotals({
    ...normalized,
    records,
    updatedAt,
  });
}

export function updateOpeningTotals(
  subject: Subject,
  held: number,
  attended: number,
): Subject {
  const openingHeld = wholeNumber(held);
  const openingAttended = Math.min(openingHeld, wholeNumber(attended));
  return recalculateSubjectTotals({
    ...subject,
    openingClassesHeld: openingHeld,
    openingClassesAttended: openingAttended,
  });
}
