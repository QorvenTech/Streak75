import assert from 'node:assert/strict';
import test from 'node:test';

import { Subject } from '../types';
import {
  openingTotals,
  removeSubjectRecord,
  saveSubjectRecord,
  updateOpeningTotals,
} from './records';

const baseSubject = (): Subject => ({
  id: 'economics',
  name: 'Economics',
  professor: 'Prof. Mehta',
  icon: 'book-open-variant',
  color: '#65D83A',
  favorite: false,
  openingClassesHeld: 10,
  openingClassesAttended: 8,
  classesHeld: 10,
  classesAttended: 8,
  records: {},
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
});

test('saves a backdated status and note in one atomic record', () => {
  const result = saveSubjectRecord(
    baseSubject(),
    '2026-06-18',
    'absent',
    'Medical leave was not approved',
    '2026-07-24T10:00:00.000Z',
  );

  assert.equal(result.record.status, 'absent');
  assert.equal(result.record.note, 'Medical leave was not approved');
  assert.equal(result.subject.records['2026-06-18']?.status, 'absent');
  assert.equal(result.subject.classesHeld, 11);
  assert.equal(result.subject.classesAttended, 8);
});

test('editing a dated status adjusts totals without adding another class', () => {
  const present = saveSubjectRecord(
    baseSubject(),
    '2026-07-20',
    'present',
    '',
  ).subject;
  const absent = saveSubjectRecord(
    present,
    '2026-07-20',
    'absent',
    'Corrected',
  ).subject;

  assert.equal(absent.classesHeld, 11);
  assert.equal(absent.classesAttended, 8);
  assert.equal(absent.records['2026-07-20']?.status, 'absent');
  assert.equal(absent.records['2026-07-20']?.note, 'Corrected');
});

test('holiday and no-class records do not affect attendance totals', () => {
  const holiday = saveSubjectRecord(
    baseSubject(),
    '2026-07-21',
    'holiday',
    '',
  ).subject;
  const noClass = saveSubjectRecord(
    holiday,
    '2026-07-22',
    'no-class',
    '',
  ).subject;

  assert.equal(noClass.classesHeld, 10);
  assert.equal(noClass.classesAttended, 8);
});

test('removing a record restores opening totals', () => {
  const marked = saveSubjectRecord(
    baseSubject(),
    '2026-07-23',
    'present',
    '',
  ).subject;
  const cleared = removeSubjectRecord(marked, '2026-07-23');

  assert.equal(cleared.records['2026-07-23'], undefined);
  assert.equal(cleared.classesHeld, 10);
  assert.equal(cleared.classesAttended, 8);
});

test('migrates legacy totals into an opening balance without changing totals', () => {
  const legacy: Subject = {
    ...baseSubject(),
    openingClassesHeld: undefined,
    openingClassesAttended: undefined,
    classesHeld: 12,
    classesAttended: 9,
    records: {
      '2026-07-20': {
        date: '2026-07-20',
        status: 'present',
        updatedAt: '2026-07-20T10:00:00.000Z',
      },
      '2026-07-21': {
        date: '2026-07-21',
        status: 'absent',
        updatedAt: '2026-07-21T10:00:00.000Z',
      },
    },
  };

  assert.deepEqual(openingTotals(legacy), { held: 10, attended: 8 });
});

test('editing opening totals keeps dated records on top', () => {
  const marked = saveSubjectRecord(
    baseSubject(),
    '2026-07-23',
    'present',
    '',
  ).subject;
  const corrected = updateOpeningTotals(marked, 20, 15);

  assert.equal(corrected.openingClassesHeld, 20);
  assert.equal(corrected.openingClassesAttended, 15);
  assert.equal(corrected.classesHeld, 21);
  assert.equal(corrected.classesAttended, 16);
});
