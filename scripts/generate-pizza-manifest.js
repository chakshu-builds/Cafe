import fs from 'fs';
import path from 'path';

const srcDir = './public/frames/pizza';
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jpg'));

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

const jsContent = `// Auto-generated verified pizza frame manifest
// Total verified frames: ${files.length}
// Missing frames noted: ${JSON.stringify(missing)}

export const PIZZA_FRAME_FILES = ${JSON.stringify(files, null, 2)};
export const PIZZA_TOTAL_FRAMES = ${files.length};
export const PIZZA_MISSING_FRAMES = ${JSON.stringify(missing)};
export const PIZZA_FRAME_DIR = '/frames/pizza/';

export function getPizzaFrameUrl(index) {
  const safeIndex = Math.max(0, Math.min(PIZZA_FRAME_FILES.length - 1, index));
  return \`\${PIZZA_FRAME_DIR}\${PIZZA_FRAME_FILES[safeIndex]}\`;
}
`;

fs.writeFileSync('src/data/pizzaManifest.js', jsContent, 'utf8');

const jsonContent = JSON.stringify({
  sourceDir: 'public/frames/pizza',
  totalFrames: files.length,
  missingFrameNumbers: missing,
  dimensions: { width: 1920, height: 1080 },
  firstFrame: files[0],
  lastFrame: files[files.length - 1],
  frames: files
}, null, 2);

fs.writeFileSync('public/frames/pizza/manifest.json', jsonContent, 'utf8');
console.log('Pizza manifest generated! Total:', files.length, 'Missing:', missing);
