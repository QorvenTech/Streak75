import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addUsageDate,
  shouldShowGoogleBackupPrompt,
} from './googleBackupPrompt';
import { GoogleBackupPromptState } from '../types';

const basePrompt = (): GoogleBackupPromptState => ({
  usageDates: ['2026-07-23'],
  subjectsAddedCount: 0,
  autoPromptShownAt: null,
});

test('shows once after three subjects are added', () => {
  const prompt = { ...basePrompt(), subjectsAddedCount: 3 };
  assert.equal(shouldShowGoogleBackupPrompt(prompt, 'anonymous'), true);
  assert.equal(shouldShowGoogleBackupPrompt(prompt, 'signed-in'), false);
});

test('shows after three distinct usage days but not three launches on one day', () => {
  let prompt = basePrompt();
  prompt = addUsageDate(prompt, new Date(2026, 6, 23, 18));
  assert.equal(prompt.usageDates.length, 1);
  prompt = addUsageDate(prompt, new Date(2026, 6, 24, 9));
  prompt = addUsageDate(prompt, new Date(2026, 6, 25, 9));
  assert.equal(shouldShowGoogleBackupPrompt(prompt, 'anonymous'), true);
});

test('never automatically repeats once it has been shown', () => {
  const prompt = {
    ...basePrompt(),
    subjectsAddedCount: 4,
    autoPromptShownAt: '2026-07-25T08:00:00.000Z',
  };
  assert.equal(shouldShowGoogleBackupPrompt(prompt, 'anonymous'), false);
});
