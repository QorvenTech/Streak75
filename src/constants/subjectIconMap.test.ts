import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  filterSubjectIcons,
  SUBJECT_ICONS,
  suggestSubjectIcon,
} from './subjectIconMap';

const cases: [string, string][] = [
  ['DBMS', 'dbms'],
  ['Database Systems', 'dbms'],
  ['OS', 'operating-systems'],
  ['Operating System', 'operating-systems'],
  ['Eco', 'economics'],
  ['Advanced Micro Economics II', 'economics'],
  ['BST', 'business-studies'],
  ['Accounts', 'accountancy'],
  ['Book Keeping', 'accountancy'],
  ['Java Programming', 'java'],
  ['DSA', 'data-structures'],
  ['C++ Programming', 'c-plus-plus'],
  ['HRM', 'human-resource-management'],
  ['Goods and Services Tax', 'gst'],
  ['Medical Lab Technology', 'medical-laboratory-technology'],
  ['React Native Development', 'mobile-app-development'],
  ['B.Ed Pedagogy', 'education'],
  ['Mass Comm', 'mass-communication'],
];

test('matches common Indian subject names, abbreviations, and variations', () => {
  for (const [query, expected] of cases) {
    assert.equal(
      suggestSubjectIcon(query).id,
      expected,
      `${query} should map to ${expected}`,
    );
  }
});

test('matches case-insensitively while the user is still typing', () => {
  assert.equal(suggestSubjectIcon('pHy').id, 'physics');
  assert.equal(suggestSubjectIcon('econ').id, 'economics');
  assert.equal(suggestSubjectIcon('cyber sec').id, 'cyber-security');
});

test('prefers the most specific phrase over a broad contained keyword', () => {
  assert.equal(suggestSubjectIcon('Business Statistics').id, 'statistics');
  assert.equal(
    suggestSubjectIcon('Financial Accounting'),
    suggestSubjectIcon('financial accounting'),
  );
  assert.equal(
    suggestSubjectIcon('Financial Accounting').id,
    'financial-accounting',
  );
});

test('returns the generic book icon when no keyword matches', () => {
  assert.equal(suggestSubjectIcon('').id, 'generic-subject');
  assert.equal(suggestSubjectIcon('Quantum Banana Seminar').id, 'generic-subject');
});

test('picker search uses labels and aliases', () => {
  assert.ok(filterSubjectIcons('database').some((icon) => icon.id === 'dbms'));
  assert.ok(
    filterSubjectIcons('book keeping').some(
      (icon) => icon.id === 'accountancy',
    ),
  );
});

test('catalog contains 110 unique subject icons plus an optimized fallback', () => {
  assert.equal(SUBJECT_ICONS.length, 111);
  assert.equal(new Set(SUBJECT_ICONS.map((icon) => icon.id)).size, 111);

  for (const icon of SUBJECT_ICONS) {
    const assetPath = path.resolve(
      process.cwd(),
      'assets',
      'subject-icons',
      `${icon.id}.webp`,
    );
    assert.ok(existsSync(assetPath), `${icon.id} asset should exist`);
    assert.ok(
      statSync(assetPath).size < 20_000,
      `${icon.id} should stay below 20 KB`,
    );
  }
});
