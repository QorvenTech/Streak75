import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const sets = [
  {
    columns: [68, 164, 260, 356, 452],
    rows: [103, 194, 284, 374, 464],
    labels: [
      'mathematics',
      'physics',
      'chemistry',
      'biology',
      'biotechnology',
      'microbiology',
      'botany',
      'zoology',
      'environmental-science',
      'geology',
      'computer-science',
      'information-technology',
      'data-science',
      'artificial-intelligence',
      'cyber-security',
      'electronics',
      'electrical-engineering',
      'mechanical-engineering',
      'civil-engineering',
      'aerospace-engineering',
      'automobile-engineering',
      'chemical-engineering',
      'instrumentation-engineering',
      'mechatronics',
      'robotics',
    ],
  },
  {
    columns: [571, 667, 763, 859, 955],
    rows: [103, 194, 284, 374, 464],
    labels: [
      'accountancy',
      'finance',
      'business-management',
      'marketing',
      'human-resource-management',
      'international-business',
      'entrepreneurship',
      'economics',
      'banking',
      'insurance',
      'auditing',
      'taxation',
      'gst',
      'business-analytics',
      'e-commerce',
      'operations-management',
      'supply-chain-management',
      'project-management',
      'hospitality-management',
      'retail-management',
      'law',
      'corporate-law',
      'constitutional-law',
      'criminal-law',
      'human-rights',
    ],
  },
  {
    columns: [1074, 1170, 1266, 1362, 1458],
    rows: [103, 194, 284, 374, 464],
    labels: [
      'english-literature',
      'hindi-literature',
      'sanskrit',
      'history',
      'political-science',
      'sociology',
      'psychology',
      'philosophy',
      'public-administration',
      'geography',
      'journalism-mass-communication',
      'education',
      'social-work',
      'linguistics',
      'foreign-languages',
      'hindi',
      'english',
      'urdu',
      'bengali',
      'tamil',
      'telugu',
      'marathi',
      'gujarati',
      'kannada',
      'malayalam',
    ],
  },
  {
    columns: [206, 313, 420, 528, 636],
    rows: [631, 716, 795, 873, 952],
    labels: [
      'fine-arts',
      'performing-arts',
      'visual-communication',
      'graphic-design',
      'interior-design',
      'fashion-design',
      'animation',
      'film-studies',
      'photography',
      'music',
      'physical-education',
      'yoga',
      'library-science',
      'archaeology',
      'anthropology',
      'tourism-management',
      'nutrition-dietetics',
      'home-science',
      'disaster-management',
      'event-management',
      'hotel-management',
      'fire-safety',
      'forensic-science',
      'criminology',
      'defense-studies',
    ],
  },
  {
    columns: [799, 912, 1025, 1138, 1251],
    rows: [631, 716, 795, 873, 952],
    labels: [
      'medicine-mbbs',
      'nursing',
      'pharmacy',
      'physiotherapy',
      'dentistry',
      'ayurveda',
      'veterinary-science',
      'optometry',
      'radiology',
      'medical-laboratory-technology',
      'bcom',
      'bba',
      'mcom',
      'mba',
      'ca',
      'cost-works-accounting',
      'company-secretaryship',
      'actuarial-science',
      'hotel-management-catering',
      'airline-airport-management',
      'bioinformatics',
      'genetics',
      'nanotechnology',
      'marine-biology',
      'environmental-engineering',
    ],
  },
];

const cropWidth = 68;
const cropHeight = 60;

async function extractSheet(sheetPath, variant) {
  const outputDir = path.resolve('assets', 'subject-icons', variant);
  await mkdir(outputDir, { recursive: true });

  for (const set of sets) {
    for (let index = 0; index < set.labels.length; index += 1) {
      const row = Math.floor(index / 5);
      const column = index % 5;
      const centerX = set.columns[column];
      const centerY = set.rows[row];
      await sharp(sheetPath)
        .extract({
          left: Math.round(centerX - cropWidth / 2),
          top: Math.round(centerY - cropHeight / 2),
          width: cropWidth,
          height: cropHeight,
        })
        .resize(112, 112, {
          fit: 'contain',
          background:
            variant === 'dark'
              ? { r: 3, g: 11, b: 23, alpha: 1 }
              : { r: 247, g: 249, b: 254, alpha: 1 },
        })
        .webp({
          quality: 84,
          alphaQuality: 90,
          effort: 6,
          smartSubsample: true,
        })
        .toFile(path.join(outputDir, `${set.labels[index]}.webp`));
    }
  }

  await copyFile(
    path.join(outputDir, 'english-literature.webp'),
    path.join(outputDir, 'generic-subject.webp'),
  );
}

const [lightSheet, darkSheet] = process.argv.slice(2);
if (!lightSheet || !darkSheet) {
  throw new Error('Provide the light and dark categorized icon sheet paths.');
}

await Promise.all([
  extractSheet(lightSheet, 'light'),
  extractSheet(darkSheet, 'dark'),
]);

console.warn('Extracted 125 paired subject icons plus themed fallbacks.');
