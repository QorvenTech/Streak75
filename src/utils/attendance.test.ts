import assert from 'node:assert/strict';
import test from 'node:test';

import {
  attendancePercentage,
  classesNeededToReachTarget,
  maxMissableClasses,
  projectedAfterAttend,
  projectedAfterMiss,
} from './attendance';

test('calculates attendance percentage from attended and held classes', () => {
  assert.equal(attendancePercentage(3, 4), 75);
  assert.equal(attendancePercentage(0, 0), 0);
  assert.equal(attendancePercentage(43, 50), 86);
});

test('returns the largest whole number of classes that can be missed', () => {
  assert.equal(maxMissableClasses(43, 50, 75), 7);
  assert.equal(maxMissableClasses(164, 200, 75), 18);
  assert.equal(maxMissableClasses(3, 4, 75), 0);
  assert.equal(maxMissableClasses(34, 50, 75), 0);
});

test('returns the smallest consecutive attendance run needed for recovery', () => {
  assert.equal(classesNeededToReachTarget(34, 50, 75), 14);
  assert.equal(classesNeededToReachTarget(37, 50, 75), 2);
  assert.equal(classesNeededToReachTarget(43, 50, 75), 0);
  assert.equal(classesNeededToReachTarget(4, 4, 100), 0);
  assert.equal(
    classesNeededToReachTarget(3, 4, 100),
    Number.POSITIVE_INFINITY,
  );
  assert.equal(
    classesNeededToReachTarget(2, 4, 100),
    Number.POSITIVE_INFINITY,
  );
});

test('projects one or more future attendance outcomes', () => {
  assert.equal(projectedAfterMiss(43, 50, 1), (43 / 51) * 100);
  assert.equal(projectedAfterAttend(43, 50, 1), (44 / 51) * 100);
  assert.equal(projectedAfterAttend(34, 50, 14), 75);
});
