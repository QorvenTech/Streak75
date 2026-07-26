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
  ['DBMS', 'computer-science'],
  ['Database Systems', 'computer-science'],
  ['OS', 'computer-science'],
  ['Operating System', 'computer-science'],
  ['Eco', 'economics'],
  ['Advanced Micro Economics II', 'economics'],
  ['BST', 'business-management'],
  ['Accounts', 'accountancy'],
  ['Book Keeping', 'accountancy'],
  ['Java Programming', 'computer-science'],
  ['DSA', 'computer-science'],
  ['C++ Programming', 'computer-science'],
  ['HRM', 'human-resource-management'],
  ['Goods and Services Tax', 'gst'],
  ['Medical Lab Technology', 'medical-laboratory-technology'],
  ['React Native Development', 'computer-science'],
  ['B.Ed Pedagogy', 'education'],
  ['Mass Comm', 'journalism-mass-communication'],
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
  assert.equal(suggestSubjectIcon('Business Statistics').id, 'mathematics');
  assert.equal(
    suggestSubjectIcon('Financial Accounting'),
    suggestSubjectIcon('financial accounting'),
  );
  assert.equal(
    suggestSubjectIcon('Financial Accounting').id,
    'accountancy',
  );
});

test('returns the generic book icon when no keyword matches', () => {
  assert.equal(suggestSubjectIcon('').id, 'generic-subject');
  assert.equal(suggestSubjectIcon('Quantum Banana Seminar').id, 'generic-subject');
});

test('picker search uses labels and aliases', () => {
  assert.ok(
    filterSubjectIcons('database').some(
      (icon) => icon.id === 'computer-science',
    ),
  );
  assert.ok(
    filterSubjectIcons('book keeping').some(
      (icon) => icon.id === 'accountancy',
    ),
  );
});

test('catalog contains 125 unique subject icons with paired optimized assets', () => {
  assert.equal(SUBJECT_ICONS.length, 125);
  assert.equal(new Set(SUBJECT_ICONS.map((icon) => icon.id)).size, 125);

  for (const icon of SUBJECT_ICONS) {
    for (const variant of ['light', 'dark']) {
      const assetPath = path.resolve(
        process.cwd(),
        'assets',
        'subject-icons',
        variant,
        `${icon.id}.webp`,
      );
      assert.ok(
        existsSync(assetPath),
        `${icon.id} ${variant} asset should exist`,
      );
      assert.ok(
        statSync(assetPath).size < 20_000,
        `${icon.id} ${variant} should stay below 20 KB`,
      );
    }
  }
});
