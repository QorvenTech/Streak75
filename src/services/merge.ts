import { PersistedAppState, Subject } from '../types';

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
  return { ...newest, records };
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
    subjects: [...subjectsById.values()],
    settings: cloud.settings ?? local.settings,
    profile: { ...local.profile, ...cloud.profile },
    selectedSubjectId:
      local.selectedSubjectId ??
      cloud.selectedSubjectId ??
      [...subjectsById.values()][0]?.id ??
      null,
  };
}
