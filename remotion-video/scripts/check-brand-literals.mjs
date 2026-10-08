// scripts/check-brand-literals.mjs
// Enforces BRD-25: No hardcoded brand hex colors, brand names, or literal copy in components/engine

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '../src');

const SCAN_DIRS = [
  path.join(srcDir, 'components'),
  path.join(srcDir, 'theme'),
  path.join(srcDir, 'engine'),
];

// Files and paths explicitly allowed (e.g., contrast formulas with default fallbacks, tests, stories)
const ALLOWED_PATHS = [
  'contrast.ts', // WCAG math formula default comparison pairs
  '__tests__',
  '.test.',
  '.stories.',
  'mock',
  'tokens',
  'fixtures',
];

const HEX_COLOR_REGEX = /['"`]#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})['"`]/g;
const BRAND_NAME_REGEX = /['"`](?:BharatQR|भारत\s*क्यूआर)['"`]/gi;

function isAllowed(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return ALLOWED_PATHS.some((allowed) => normalized.includes(allowed));
}

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))
    ) {
      if (!isAllowed(fullPath)) {
        fileList.push(fullPath);
      }
    }
  }

  return fileList;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  const files = getAllFiles(dir);

  for (const file of files) {
    const relativePath = path.relative(srcDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      // Strip comments
      const cleanLine = line.replace(/\/\/.*$/, '');

      // Check hex literals
      let match;
      while ((match = HEX_COLOR_REGEX.exec(cleanLine)) !== null) {
        violations.push({
          file: relativePath,
          line: lineIndex + 1,
          type: 'HARDCODED_HEX_COLOR',
          match: match[0],
          snippet: line.trim(),
        });
      }

      // Check brand name literals
      while ((match = BRAND_NAME_REGEX.exec(cleanLine)) !== null) {
        violations.push({
          file: relativePath,
          line: lineIndex + 1,
          type: 'HARDCODED_BRAND_NAME',
          match: match[0],
          snippet: line.trim(),
        });
      }
    });
  }
}

if (violations.length > 0) {
  console.error('\nFAIL (BRD-25): Detected hardcoded brand literals in scanned source code:\n');
  console.table(
    violations.map((v) => ({
      file: `${v.file}:${v.line}`,
      type: v.type,
      literal: v.match,
    }))
  );
  console.error('\nRemedy: Replace raw hex colors and brand strings with tokens from useTheme() or catalog props.\n');
  process.exit(1);
}

console.log('PASS (BRD-25): Zero hardcoded hex colors or brand names found in src/components, src/theme, or src/engine.');
process.exit(0);
