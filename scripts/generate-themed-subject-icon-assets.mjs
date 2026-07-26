import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const iconDirectory = path.resolve('assets', 'subject-icons', 'light');
const ids = (await readdir(iconDirectory))
  .filter((filename) => filename.endsWith('.webp'))
  .map((filename) => filename.replace(/\.webp$/, ''))
  .sort((left, right) => left.localeCompare(right));

const entries = ids
  .map(
    (id) => `  '${id}': {
    light: require('../../assets/subject-icons/light/${id}.webp'),
    dark: require('../../assets/subject-icons/dark/${id}.webp'),
  },`,
  )
  .join('\n');

const source = `import type { ImageSourcePropType } from 'react-native';

export interface SubjectIconAssetPair {
  light: ImageSourcePropType;
  dark: ImageSourcePropType;
}

/**
 * Generated from the approved categorized Streak75 icon sheets.
 * Run scripts/generate-themed-subject-icon-assets.mjs after re-extracting.
 */
export const SUBJECT_ICON_ASSETS = {
${entries}
} satisfies Record<string, SubjectIconAssetPair>;

export type SubjectIconId = keyof typeof SUBJECT_ICON_ASSETS;
`;

await writeFile(
  path.resolve('src', 'constants', 'subjectIconAssets.ts'),
  source,
  'utf8',
);

console.warn(`Generated paired asset references for ${ids.length} icons.`);
