import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const pkgPath = path.resolve(projectRoot, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Forbidden packages explicitly defined in PRD section 7.14 and docs/licensing.md
const FORBIDDEN_PACKAGES = new Set([
  'framer-motion',
  'motion',
  'react-spring',
  'lygia',
  'coqui',
  'madmom',
  'essentia',
]);

// Permissive and allowed license identifiers
const ALLOWED_LICENSES = new Set([
  'MIT',
  'ISC',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'CC0-1.0',
  'Remotion License',
  'Custom: https://remotion.dev/license',
]);

const FORBIDDEN_LICENSE_PATTERNS = [
  /GPL/i,
  /AGPL/i,
  /NON-COMMERCIAL/i,
  /CC-BY-NC/i,
  /PROPRIETARY/i,
];

function getInstalledLicense(depName) {
  try {
    const depPkgPath = path.resolve(projectRoot, 'node_modules', depName, 'package.json');
    if (fs.existsSync(depPkgPath)) {
      const depPkg = JSON.parse(fs.readFileSync(depPkgPath, 'utf8'));
      if (typeof depPkg.license === 'string') {
        return depPkg.license;
      }
      if (depPkg.license && typeof depPkg.license.type === 'string') {
        return depPkg.license.type;
      }
      if (Array.isArray(depPkg.licenses) && depPkg.licenses[0]?.type) {
        return depPkg.licenses[0].type;
      }
    }
  } catch (err) {
    // ignore
  }
  return 'UNKNOWN';
}

const allDeps = {
  ...pkg.dependencies,
  ...pkg.devDependencies,
  ...pkg.optionalDependencies,
};

let hasErrors = false;
const table = [];

console.log('--- Motion Studio License Verification ---\n');

for (const [dep, version] of Object.entries(allDeps)) {
  // Check forbidden package names
  const isForbiddenPkg = FORBIDDEN_PACKAGES.has(dep.toLowerCase());
  if (isForbiddenPkg) {
    console.error(`ERROR: Prohibited package detected: ${dep}`);
    hasErrors = true;
    continue;
  }

  let license = getInstalledLicense(dep);

  // Normalize Remotion license names
  if (dep === 'remotion' || dep.startsWith('@remotion/')) {
    if (
      license === 'UNLICENSED' ||
      license.toLowerCase().includes('remotion') ||
      license === 'UNKNOWN' ||
      license.toLowerCase().includes('see license')
    ) {
      license = 'Remotion License';
    }
  }

  // Check forbidden license patterns
  const isForbiddenLicense = FORBIDDEN_LICENSE_PATTERNS.some((pat) => pat.test(license));
  const isAllowed = ALLOWED_LICENSES.has(license);

  const status = isForbiddenLicense || (!isAllowed && license !== 'Remotion License')
    ? 'FLAGGED'
    : 'OK';

  table.push({
    Package: dep,
    Version: version,
    License: license,
    Status: status,
  });

  if (status === 'FLAGGED') {
    console.error(`ERROR: Package "${dep}" has unapproved or restricted license: "${license}"`);
    hasErrors = true;
  }
}

console.table(table);

if (hasErrors) {
  console.error('\nFAIL: License check found forbidden or unapproved packages.');
  process.exit(1);
}

console.log('\nPASS: All dependencies adhere to open-source / Remotion licensing requirements.');
process.exit(0);
