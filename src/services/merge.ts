import { DEFAULT_SETTINGS } from '../data/defaults';
import { PersistedAppState, Subject } from '../types';
import { recalculateSubjectTotals } from '../utils/records';

const mergeSubject = (local: Subject, cloud: Subject): Subject => {
  const records = { ...cloud.records, ...local.records };
  Object.keys(records).forEach((date) => {
    const localRecord = local.records[date];
    const cloudRecord = cloud.records[date];
    if (!localRecord || !cloudRecord) return;
    records[date] =
      localRecord.updatedAt >= cloudRecord.updatedAt ? localRecord : cloudRecord;
  });
  const newest = local.updatedAt >= cloud.updatedAt ? local : cloud;
  return recalculateSubjectTotals({ ...newest, records });
};

export function mergeCloudState(
  local: PersistedAppState,
  cloud: Partial<PersistedAppState>,
): PersistedAppState {
  const subjectsById = new Map(local.subjects.map((subject) => [subject.id, subject]));
  cloud.subjects?.forEach((cloudSubject) => {
    const localSubject = subjectsById.get(cloudSubject.id);
    subjectsById.set(
      cloudSubject.id,
      localSubject ? mergeSubject(localSubject, cloudSubject) : cloudSubject,
    );
  });
  return {
    ...local,
    ...cloud,
    subjects: [...subjectsById.values()].map(recalculateSubjectTotals),
    settings: cloud.settings ?? local.settings,
    profile: { ...local.profile, ...cloud.profile },
    selectedSubjectId:
      local.selectedSubjectId ??
      cloud.selectedSubjectId ??
      [...subjectsById.values()][0]?.id ??
      null,
  };
}

export function activateExistingCloudAccount(
  local: PersistedAppState,
  cloud: Partial<PersistedAppState>,
): PersistedAppState {
  const subjects = (cloud.subjects ?? []).map(recalculateSubjectTotals);
  const requestedSelection = cloud.selectedSubjectId;
  const selectedSubjectId =
    requestedSelection &&
    subjects.some((subject) => subject.id === requestedSelection)
      ? requestedSelection
      : (subjects[0]?.id ?? null);
  return {
    ...local,
    ...cloud,
    subjects,
    settings: cloud.settings ?? DEFAULT_SETTINGS,
    profile: { ...local.profile, ...cloud.profile },
    selectedSubjectId,
  };
}
