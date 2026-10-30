import fs from 'fs';
import path from 'path';

const srcDir = './public/hero-frames';
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.webp'));

// Natural numeric sorting
files.sort((a, b) => {
  const numA = parseInt(a.match(/\d+/)[0], 10);
  const numB = parseInt(b.match(/\d+/)[0], 10);
  return numA - numB;
});

const numbers = files.map(f => parseInt(f.match(/\d+/)[0], 10));
const missing = [];
for (let n = numbers[0]; n <= numbers[numbers.length - 1]; n++) {
  if (!numbers.includes(n)) {
    missing.push(n);
  }
}

if (!fs.existsSync('src/data')) {
  fs.mkdirSync('src/data', { recursive: true });
}

const jsContent = `// Auto-generated verified frame manifest
// Source: public/hero-frames
// Total verified frames: ${files.length}
// Missing frames noted from continuous numbering: ${JSON.stringify(missing)}

export const FRAME_FILES = ${JSON.stringify(files, null, 2)};
export const TOTAL_FRAMES = ${files.length};
export const MISSING_FRAME_NUMBERS = ${JSON.stringify(missing)};
export const FRAME_DIR = '/hero-frames/';

export function getFrameUrl(index) {
  const safeIndex = Math.max(0, Math.min(FRAME_FILES.length - 1, index));
  return \`\${FRAME_DIR}\${FRAME_FILES[safeIndex]}\`;
}
`;

fs.writeFileSync('src/data/framesManifest.js', jsContent, 'utf8');

const jsonContent = JSON.stringify({
  sourceDir: 'public/hero-frames',
  totalFrames: files.length,
  missingFrameNumbers: missing,
  dimensions: { width: 1920, height: 1080 },
  firstFrame: files[0],
  lastFrame: files[files.length - 1],
  frames: files
}, null, 2);

fs.writeFileSync('public/hero-frames/manifest.json', jsonContent, 'utf8');
console.log('Manifest updated! Source: public/hero-frames | Total:', files.length, '| Missing:', missing);

