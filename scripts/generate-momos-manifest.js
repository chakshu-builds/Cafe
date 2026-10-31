import fs from 'fs';
import path from 'path';

const destDir = './public/frames/momos';

if (!fs.existsSync(destDir)) {
  console.error(`Error: Destination directory '${destDir}' not found!`);
  process.exit(1);
}

// Read destination files and sort naturally
const files = fs.readdirSync(destDir).filter(f => f.toLowerCase().endsWith('.jpg'));

files.sort((a, b) => {
  const matchA = a.match(/\d+/);
  const matchB = b.match(/\d+/);
  const numA = matchA ? parseInt(matchA[0], 10) : 0;
  const numB = matchB ? parseInt(matchB[0], 10) : 0;
  return numA - numB;
});

// Check sequence
const numbers = files.map(f => parseInt(f.match(/\d+/)[0], 10));
const missing = [];
for (let n = numbers[0]; n <= numbers[numbers.length - 1]; n++) {
  if (!numbers.includes(n)) {
    missing.push(n);
  }
}

// Determine dimensions of first frame
function getJpgDimensions(filepath) {
  const buf = fs.readFileSync(filepath);
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xFF) break;
    const marker = buf[offset + 1];
    if (marker === 0xC0 || marker === 0xC2) {
      const height = buf.readUInt16BE(offset + 5);
      const width = buf.readUInt16BE(offset + 7);
      return { width, height };
    }
    const len = buf.readUInt16BE(offset + 2);
    offset += 2 + len;
  }
  return { width: 1920, height: 1080 };
}

const dims = files.length > 0 ? getJpgDimensions(path.join(destDir, files[0])) : { width: 1920, height: 1080 };

if (!fs.existsSync('src/data')) {
  fs.mkdirSync('src/data', { recursive: true });
}

const jsContent = `// Auto-generated verified momos frame manifest
// Source: momos_frames_24fps
// Total verified frames: ${files.length}
// Missing frames noted: ${JSON.stringify(missing)}
// Dimensions: ${dims.width}x${dims.height}

export const MOMOS_FRAME_FILES = ${JSON.stringify(files, null, 2)};
export const MOMOS_TOTAL_FRAMES = ${files.length};
export const MOMOS_MISSING_FRAMES = ${JSON.stringify(missing)};
export const MOMOS_FRAME_DIR = '/frames/momos/';
export const MOMOS_FRAME_DIMS = { width: ${dims.width}, height: ${dims.height} };

export function getMomosFrameUrl(index) {
  const safeIndex = Math.max(0, Math.min(MOMOS_FRAME_FILES.length - 1, index));
  return \`\${MOMOS_FRAME_DIR}\${MOMOS_FRAME_FILES[safeIndex]}\`;
}
`;

fs.writeFileSync('src/data/momosManifest.js', jsContent, 'utf8');

const jsonContent = JSON.stringify({
  sourceDir: 'momos_frames_24fps',
  publicDir: 'public/images/momos-frames',
  totalFrames: files.length,
  missingFrameNumbers: missing,
  dimensions: dims,
  firstFrame: files[0],
  lastFrame: files[files.length - 1],
  frames: files
}, null, 2);

fs.writeFileSync(path.join(destDir, 'manifest.json'), jsonContent, 'utf8');

console.log(`Momos manifest generated successfully!`);
console.log(`Total: ${files.length} frames | Dimensions: ${dims.width}x${dims.height} | First: ${files[0]} | Last: ${files[files.length - 1]}`);
console.log(`Missing frames: ${missing.length === 0 ? 'None (continuous)' : JSON.stringify(missing)}`);
