import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
const remotionPkgs = [];

for (const sec of sections) {
  const deps = pkg[sec] || {};
  for (const [name, version] of Object.entries(deps)) {
    if (name === 'remotion' || name.startsWith('@remotion/')) {
      remotionPkgs.push({ name, version, section: sec });
    }
  }
}

if (remotionPkgs.length === 0) {
  console.error('Error: No remotion or @remotion/* packages found.');
  process.exit(1);
}

let targetVersion = null;
let hasError = false;

for (const { name, version, section } of remotionPkgs) {
  if (version.startsWith('^') || version.startsWith('~') || version.includes('>') || version.includes('<') || version.includes('*')) {
    console.error(`Error: Package ${name} in ${section} has non-pinned version: "${version}". Remotion packages must be exact.`);
    hasError = true;
  }
  const cleanVersion = version.replace(/^[\^~]/, '');
  if (!targetVersion) {
    targetVersion = cleanVersion;
  } else if (cleanVersion !== targetVersion) {
    console.error(`Error: Version mismatch! Expected ${targetVersion}, but ${name} is ${cleanVersion}.`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log(`PASS: All ${remotionPkgs.length} remotion packages are pinned to exact version ${targetVersion}:`);
for (const { name, version } of remotionPkgs) {
  console.log(`  - ${name}: ${version}`);
}
process.exit(0);
