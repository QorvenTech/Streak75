import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const sheets = [
  {
    rows: [418, 623, 824, 1024, 1228],
    labels: [
      'mathematics',
      'physics',
      'chemistry',
      'biology',
      'computer-science',
      'english',
      'hindi',
      'economics',
      'political-science',
      'history',
      'geography',
      'sociology',
      'psychology',
      'philosophy',
      'statistics',
      'environmental-science',
      'commerce',
      'business-studies',
      'accountancy',
      'sanskrit',
      'physical-education',
      'general-science',
    ],
  },
  {
    rows: [443, 648, 849, 1052, 1253],
    labels: [
      'financial-accounting',
      'cost-accounting',
      'management-accounting',
      'taxation',
      'gst',
      'auditing',
      'business-law',
      'company-law',
      'banking',
      'finance',
      'marketing',
      'human-resource-management',
      'entrepreneurship',
      'international-business',
      'e-commerce',
      'supply-chain-management',
      'operations-management',
      'business-analytics',
      'public-administration',
      'hotel-management',
      'tourism-management',
      'retail-management',
    ],
  },
  {
    rows: [421, 624, 824, 1025, 1247],
    labels: [
      'programming',
      'java',
      'python',
      'c-plus-plus',
      'data-structures',
      'dbms',
      'operating-systems',
      'computer-networks',
      'web-development',
      'mobile-app-development',
      'artificial-intelligence',
      'machine-learning',
      'cyber-security',
      'data-science',
      'mechanical-engineering',
      'electrical-engineering',
      'electronics-communication',
      'civil-engineering',
      'architecture',
      'robotics',
      'mechatronics',
      'automobile-engineering',
    ],
  },
  {
    rows: [433, 640, 841, 1049, 1252],
    labels: [
      'botany',
      'zoology',
      'biotechnology',
      'microbiology',
      'biochemistry',
      'anatomy',
      'physiology',
      'nursing',
      'pharmacology',
      'pathology',
      'medical-laboratory-technology',
      'agriculture',
      'horticulture',
      'food-technology',
      'nutrition-dietetics',
      'home-science',
      'forestry',
      'soil-science',
      'fisheries',
      'veterinary-science',
      'environmental-management',
      'geology',
    ],
  },
  {
    rows: [445, 648, 850, 1052, 1255],
    labels: [
      'journalism',
      'mass-communication',
      'fine-arts',
      'graphic-design',
      'fashion-design',
      'interior-design',
      'animation',
      'film-studies',
      'music',
      'dance',
      'theatre',
      'library-science',
      'archaeology',
      'anthropology',
      'linguistics',
      'education',
      'social-work',
      'rural-development',
      'urdu',
      'french',
      'german',
      'event-management',
    ],
  },
];

const columnCenters = [165, 365, 565, 765, 965];
const finalRowCenters = [465, 665];
const cropWidth = 170;
const cropHeight = 150;
const outputSize = 128;
const iconSize = 108;

function alphaForPixel(red, green, blue) {
  const strongest = Math.max(red, green, blue);
  const weakest = Math.min(red, green, blue);
  const chroma = strongest - weakest;
  const brightnessSignal = strongest - 45;
  const colorSignal = chroma - 12;
  const signal = Math.max(brightnessSignal * 4.4, colorSignal * 3.1);
  if (signal < 40) return 0;
  return Math.max(0, Math.min(255, Math.round((signal - 28) * 1.35)));
}

async function extractIcon(sheetPath, centerX, centerY, outputPath) {
  const { data, info } = await sharp(sheetPath)
    .extract({
      left: Math.round(centerX - cropWidth / 2),
      top: Math.round(centerY - cropHeight / 2),
      width: cropWidth,
      height: cropHeight,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * 4;
      const onOuterEdge =
        x < 16 || x >= info.width - 16 || y < 13 || y >= info.height - 13;
      const inNumberBadge = x < 42 && y < 50;
      const inBadgeGlow =
        x < 60 &&
        y < 65 &&
        data[offset + 1] > 135 &&
        data[offset + 1] > data[offset] * 1.25 &&
        data[offset + 1] > data[offset + 2] * 1.8;
      data[offset + 3] =
        onOuterEdge || inNumberBadge || inBadgeGlow
          ? 0
          : alphaForPixel(data[offset], data[offset + 1], data[offset + 2]);
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 3 })
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .extend({
      top: (outputSize - iconSize) / 2,
      bottom: (outputSize - iconSize) / 2,
      left: (outputSize - iconSize) / 2,
      right: (outputSize - iconSize) / 2,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 82, alphaQuality: 90, effort: 6, smartSubsample: true })
    .toFile(outputPath);
}

async function main() {
  const sheetPaths = process.argv.slice(2);
  if (sheetPaths.length !== sheets.length) {
    throw new Error(
      `Expected ${sheets.length} sheet paths. Received ${sheetPaths.length}.`,
    );
  }

  const outputDir = path.resolve('assets', 'subject-icons');
  await mkdir(outputDir, { recursive: true });

  for (let sheetIndex = 0; sheetIndex < sheets.length; sheetIndex += 1) {
    const sheet = sheets[sheetIndex];
    const sheetPath = sheetPaths[sheetIndex];

    for (let iconIndex = 0; iconIndex < sheet.labels.length; iconIndex += 1) {
      const row = Math.floor(iconIndex / 5);
      const column = iconIndex % 5;
      const centerX =
        row === 4 ? finalRowCenters[column] : columnCenters[column];
      const centerY = sheet.rows[row];
      const filename = `${sheet.labels[iconIndex]}.webp`;
      await extractIcon(
        sheetPath,
        centerX,
        centerY,
        path.join(outputDir, filename),
      );
    }
  }

  await copyFile(
    path.join(outputDir, 'english.webp'),
    path.join(outputDir, 'generic-subject.webp'),
  );

  console.warn(`Extracted 110 icons plus fallback into ${outputDir}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
