import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const outDir = path.resolve(projectRoot, 'out/determinism');
const run1Dir = path.resolve(outDir, 'run1');
const run2Dir = path.resolve(outDir, 'run2');

fs.mkdirSync(run1Dir, { recursive: true });
fs.mkdirSync(run2Dir, { recursive: true });

const frames = [0, 15, 30, 45];
const compositionId = 'HelloDeterminism';

function renderStill(frame, outputPath) {
  const relPath = path.relative(projectRoot, outputPath).replace(/\\/g, '/');
  const cmd = `npx remotion still ${compositionId} "${relPath}" --frame=${frame} --log=warn`;
  execSync(cmd, { cwd: projectRoot, stdio: 'inherit' });
}

function computeHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

console.log('--- Step 1: Rendering Run 1 Stills ---');
for (const frame of frames) {
  const filePath = path.resolve(run1Dir, `frame_${frame}.png`);
  console.log(`Rendering frame ${frame} (Run 1)...`);
  renderStill(frame, filePath);
}

console.log('\n--- Step 2: Rendering Run 2 Stills ---');
for (const frame of frames) {
  const filePath = path.resolve(run2Dir, `frame_${frame}.png`);
  console.log(`Rendering frame ${frame} (Run 2)...`);
  renderStill(frame, filePath);
}

console.log('\n--- Step 3: Comparing Frame SHA-256 Hashes ---');
let allMatch = true;

for (const frame of frames) {
  const file1 = path.resolve(run1Dir, `frame_${frame}.png`);
  const file2 = path.resolve(run2Dir, `frame_${frame}.png`);

  const hash1 = computeHash(file1);
  const hash2 = computeHash(file2);

  const match = hash1 === hash2;
  console.log(`Frame ${frame}:`);
  console.log(`  Run 1: ${hash1}`);
  console.log(`  Run 2: ${hash2}`);
  console.log(`  Status: ${match ? 'MATCH (PASS)' : 'MISMATCH (FAIL)'}`);

  if (!match) {
    allMatch = false;
  }
}

if (!allMatch) {
  console.error('\nERROR: Non-deterministic render detected! SHA-256 hashes differ.');
  process.exit(1);
}

console.log('\nPASS: HelloDeterminism rendered deterministically across all tested frames (0, 15, 30, 45).');
process.exit(0);
