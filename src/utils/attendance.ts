import { AttendanceStatus, ColorBand, Subject } from '../types';

const EPSILON = 1e-9;

export function attendancePercentage(attended: number, held: number): number {
  if (held <= 0) return 0;
  return (attended / held) * 100;
}

export function roundedAttendance(attended: number, held: number): number {
  return Math.round(attendancePercentage(attended, held));
}

export function maxMissableClasses(
  attended: number,
  held: number,
  targetPercentage: number,
): number {
  if (held < 0 || attended < 0 || targetPercentage <= 0 || targetPercentage > 100) {
    return 0;
  }
  const target = targetPercentage / 100;
  if (attendancePercentage(attended, held) + EPSILON < targetPercentage) return 0;
  return Math.max(0, Math.floor(attended / target - held + EPSILON));
}

export function classesNeededToReachTarget(
  attended: number,
  held: number,
  targetPercentage: number,
): number {
  if (held < 0 || attended < 0 || targetPercentage <= 0 || targetPercentage >= 100) {
    return targetPercentage === 100 && attended < held ? Number.POSITIVE_INFINITY : 0;
  }
  if (attendancePercentage(attended, held) + EPSILON >= targetPercentage) return 0;
  const target = targetPercentage / 100;
  return Math.max(0, Math.ceil((target * held - attended) / (1 - target) - EPSILON));
}

export function projectedAfterMiss(attended: number, held: number, misses = 1): number {
  return attendancePercentage(attended, held + Math.max(0, misses));
}

export function projectedAfterAttend(attended: number, held: number, classes = 1): number {
  const next = Math.max(0, classes);
  return attendancePercentage(attended + next, held + next);
}

export function getColorBand(percentage: number, bands: ColorBand[]): ColorBand {
  const sorted = [...bands].sort((a, b) => b.minimum - a.minimum);
  return sorted.find((band) => percentage >= band.minimum) ?? sorted[sorted.length - 1]!;
}

export function aggregateSubjects(subjects: Subject[]): {
  classesHeld: number;
  classesAttended: number;
  percentage: number;
} {
  const totals = subjects.reduce(
    (sum, subject) => ({
      classesHeld: sum.classesHeld + subject.classesHeld,
      classesAttended: sum.classesAttended + subject.classesAttended,
    }),
    { classesHeld: 0, classesAttended: 0 },
  );
  return {
    ...totals,
    percentage: attendancePercentage(totals.classesAttended, totals.classesHeld),
  };
}

export function statusContribution(status?: AttendanceStatus): {
  held: number;
  attended: number;
} {
  switch (status) {
    case 'present':
      return { held: 1, attended: 1 };
    case 'absent':
    case 'leave':
      return { held: 1, attended: 0 };
    default:
      return { held: 0, attended: 0 };
  }
}
