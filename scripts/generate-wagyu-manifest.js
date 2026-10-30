import fs from 'fs';
import path from 'path';

const srcDir = './wagyu_burger_frames_24fps';
const destDir = './public/images/wagyu-burger-frames';

if (!fs.existsSync(srcDir)) {
  console.error(`Error: Source directory '${srcDir}' not found!`);
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 1. Copy frames to public destination if missing or different size
const srcFiles = fs.readdirSync(srcDir).filter(f => f.toLowerCase().endsWith('.jpg'));
console.log(`Found ${srcFiles.length} frames in ${srcDir}. Syncing to ${destDir}...`);

for (const file of srcFiles) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  if (!fs.existsSync(destPath) || fs.statSync(srcPath).size !== fs.statSync(destPath).size) {
    fs.copyFileSync(srcPath, destPath);
  }
}

// 2. Read destination files and sort naturally
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

const jsContent = `// Auto-generated verified Signature Wagyu Burger frame manifest
// Source: wagyu_burger_frames_24fps
// Total verified frames: ${files.length}
// Missing frames noted: ${JSON.stringify(missing)}
// Dimensions: ${dims.width}x${dims.height}

export const WAGYU_FRAME_FILES = ${JSON.stringify(files, null, 2)};
export const WAGYU_TOTAL_FRAMES = ${files.length};
export const WAGYU_MISSING_FRAMES = ${JSON.stringify(missing)};
export const WAGYU_FRAME_DIR = '/images/wagyu-burger-frames/';
export const WAGYU_FRAME_DIMS = { width: ${dims.width}, height: ${dims.height} };

export function getWagyuFrameUrl(index) {
  const safeIndex = Math.max(0, Math.min(WAGYU_FRAME_FILES.length - 1, index));
  return \`\${WAGYU_FRAME_DIR}\${WAGYU_FRAME_FILES[safeIndex]}\`;
}
`;

fs.writeFileSync('src/data/wagyuManifest.js', jsContent, 'utf8');

const jsonContent = JSON.stringify({
  sourceDir: 'wagyu_burger_frames_24fps',
  publicDir: 'public/images/wagyu-burger-frames',
  totalFrames: files.length,
  missingFrameNumbers: missing,
  dimensions: dims,
  firstFrame: files[0],
  lastFrame: files[files.length - 1],
  frames: files
}, null, 2);

fs.writeFileSync(path.join(destDir, 'manifest.json'), jsonContent, 'utf8');

console.log(`Wagyu burger manifest generated successfully!`);
console.log(`Total: ${files.length} frames | Dimensions: ${dims.width}x${dims.height} | First: ${files[0]} | Last: ${files[files.length - 1]}`);
console.log(`Missing frames: ${missing.length === 0 ? 'None (continuous)' : JSON.stringify(missing)}`);
