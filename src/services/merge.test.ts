import assert from 'node:assert/strict';
import test from 'node:test';

import { createInitialState } from '../data/defaults';
import { Subject } from '../types';
import { activateExistingCloudAccount, mergeCloudState } from './merge';

const makeSubject = (
  id: string,
  updatedAt: string,
  recordUpdatedAt: string,
  note: string,
): Subject => ({
  id,
  name: 'Economics',
  professor: 'Prof. Mehta',
  icon: 'book',
  color: '#65D83A',
  favorite: false,
  classesHeld: 10,
  classesAttended: 8,
  createdAt: updatedAt,
  updatedAt,
  records: {
    '2026-07-24': {
      date: '2026-07-24',
      status: 'present',
      note,
      updatedAt: recordUpdatedAt,
    },
  },
});

test('merges subjects and keeps the newest version of each record', () => {
  const base = createInitialState();
  const local = makeSubject(
    'shared',
    '2026-07-20T00:00:00.000Z',
    '2026-07-24T10:00:00.000Z',
    'local',
  );
  const cloud = makeSubject(
    'shared',
    '2026-07-21T00:00:00.000Z',
    '2026-07-24T09:00:00.000Z',
    'cloud',
  );
  const merged = mergeCloudState(
    { ...base, subjects: [local] },
    { subjects: [cloud] },
  );
  assert.equal(merged.subjects.length, 1);
  assert.equal(merged.subjects[0]?.updatedAt, cloud.updatedAt);
  assert.equal(merged.subjects[0]?.records['2026-07-24']?.note, 'local');
});

test('activates an older Google account without merging anonymous subjects', () => {
  const base = createInitialState();
  const anonymousSubject = makeSubject(
    'anonymous-only',
    '2026-07-24T08:00:00.000Z',
    '2026-07-24T08:00:00.000Z',
    'temporary phone data',
  );
  const existingSubject = makeSubject(
    'existing-google',
    '2026-07-24T09:00:00.000Z',
    '2026-07-24T09:00:00.000Z',
    'other device data',
  );
  const activated = activateExistingCloudAccount(
    { ...base, subjects: [anonymousSubject] },
    {
      subjects: [existingSubject],
      profile: {
        ...base.profile,
        uid: 'existing-google-uid',
        authMode: 'signed-in',
      },
    },
  );
  assert.deepEqual(
    activated.subjects.map((subject) => subject.id),
    ['existing-google'],
  );
  assert.equal(activated.selectedSubjectId, 'existing-google');
  assert.equal(activated.googleBackupPrompt, base.googleBackupPrompt);
});
