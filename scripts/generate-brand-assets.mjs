import { Buffer } from 'node:buffer';
import sharp from 'sharp';

const navy = '#020B18';
const lime = '#B6F20C';
const cyan = '#35C5F0';

const shield = (size, monochrome = false) => {
  const primary = monochrome ? '#FFFFFF' : lime;
  const secondary = monochrome ? '#FFFFFF' : cyan;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" rx="220" fill="${monochrome ? 'transparent' : navy}"/>
      <path d="M512 112 790 205v249c0 214-121 369-278 458C355 823 234 668 234 454V205l278-93Z"
        fill="none" stroke="${primary}" stroke-width="54" stroke-linejoin="round"/>
      <path d="M512 112 790 205v249c0 214-121 369-278 458"
        fill="none" stroke="${secondary}" stroke-width="54" stroke-linejoin="round"/>
      <path d="m363 699 92 86 196-232" fill="none" stroke="${primary}" stroke-width="48"
        stroke-linecap="round" stroke-linejoin="round"/>
      <text x="512" y="564" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="300" font-weight="800" fill="white">75</text>
      <path d="M355 292h80M589 292h80" stroke="${primary}" stroke-width="36" stroke-linecap="round"/>
    </svg>`;
};

const writePng = async (filename, svg, width, height = width) => {
  await sharp(Buffer.from(svg)).resize(width, height).png().toFile(filename);
};

await Promise.all([
  writePng('assets/icon.png', shield(1024), 1024),
  writePng('assets/splash-icon.png', shield(1024), 512),
  writePng('assets/android-icon-foreground.png', shield(1024), 432),
  writePng(
    'assets/android-icon-background.png',
    `<svg width="432" height="432" xmlns="http://www.w3.org/2000/svg"><rect width="432" height="432" fill="${navy}"/></svg>`,
    432,
  ),
  writePng('assets/android-icon-monochrome.png', shield(1024, true), 432),
  writePng('assets/favicon.png', shield(256), 256),
]);

console.warn('Generated Streak75 brand assets.');
