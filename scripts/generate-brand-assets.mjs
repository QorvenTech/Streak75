import { Buffer } from 'node:buffer';

import sharp from 'sharp';

const lightBackground = '#F7F9FE';
const mark = ({
  size,
  background = 'transparent',
  dark = false,
  monochrome = false,
}) => {
  const textStart = monochrome ? '#FFFFFF' : dark ? '#FFFFFF' : '#071B59';
  const textEnd = monochrome ? '#FFFFFF' : '#175CFF';
  const blue = monochrome ? '#FFFFFF' : '#175CFF';
  const teal = monochrome ? '#FFFFFF' : '#10BFA8';
  const purple = monochrome ? '#FFFFFF' : '#7C3AED';
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${blue}"/>
          <stop offset=".52" stop-color="${teal}"/>
          <stop offset="1" stop-color="${purple}"/>
        </linearGradient>
        <linearGradient id="number" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${textStart}"/>
          <stop offset=".64" stop-color="${textEnd}"/>
          <stop offset="1" stop-color="${purple}"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="${background}"/>
      <path d="M220 790C91 600 106 356 239 193 386 13 655-8 848 103"
        fill="none" stroke="url(#ring)" stroke-width="68" stroke-linecap="round"/>
      <path d="M682 285h244l-65 86H650Z" fill="${teal}"/>
      <path d="M709 414h188l-66 86H675Z" fill="${blue}"/>
      <path d="M681 543h163l-73 86H638Z" fill="${purple}"/>
      <text x="493" y="714" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="610" font-style="italic" font-weight="900" fill="url(#number)">75</text>
    </svg>`;
};

const writePng = async (filename, svg, width, height = width) => {
  await sharp(Buffer.from(svg)).resize(width, height).png().toFile(filename);
};

await Promise.all([
  writePng(
    'assets/icon.png',
    mark({ size: 1024, background: lightBackground }),
    1024,
  ),
  writePng(
    'assets/splash-icon.png',
    mark({ size: 1024, background: 'transparent' }),
    512,
  ),
  writePng(
    'assets/splash-icon-dark.png',
    mark({ size: 1024, background: 'transparent', dark: true }),
    512,
  ),
  writePng(
    'assets/android-icon-foreground.png',
    mark({ size: 1024, background: 'transparent' }),
    432,
  ),
  writePng(
    'assets/android-icon-background.png',
    `<svg width="432" height="432" xmlns="http://www.w3.org/2000/svg"><rect width="432" height="432" fill="${lightBackground}"/></svg>`,
    432,
  ),
  writePng(
    'assets/android-icon-monochrome.png',
    mark({
      size: 1024,
      background: 'transparent',
      dark: true,
      monochrome: true,
    }),
    432,
  ),
  writePng(
    'assets/favicon.png',
    mark({ size: 256, background: lightBackground }),
    256,
  ),
]);

console.warn('Generated the approved circular-gradient Streak75 brand assets.');
