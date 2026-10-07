import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const templateDir = path.resolve(repoRoot, 'brands/_template');

const args = process.argv.slice(2);
const brandId = args[0];
const displayNameArg = args[1];

if (!brandId) {
  console.error('Error: Brand ID is required. Usage: npm run brand:new <id> [displayName]');
  process.exit(1);
}

// Requirement: validates the id (a-z, 0-9, -)
const ID_REGEX = /^[a-z0-9-]+$/;
if (!ID_REGEX.test(brandId)) {
  console.error(`Error: Invalid brand ID "${brandId}". Must only contain lowercase letters, numbers, and hyphens (/^[a-z0-9-]+$/).`);
  process.exit(1);
}

const targetDir = path.resolve(repoRoot, 'brands', brandId);
if (fs.existsSync(targetDir)) {
  console.error(`Error: Brand directory already exists: ${targetDir}`);
  process.exit(1);
}

if (!fs.existsSync(templateDir)) {
  console.error(`Error: Brand template directory not found: ${templateDir}`);
  process.exit(1);
}

const displayName = displayNameArg || brandId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

console.log(`Creating new brand "${brandId}" (${displayName}) from _template...`);

// Recursive copy of directory
fs.cpSync(templateDir, targetDir, { recursive: true });

// Customize brand.json
const brandJsonPath = path.resolve(targetDir, 'brand.json');
if (fs.existsSync(brandJsonPath)) {
  let content = fs.readFileSync(brandJsonPath, 'utf8');
  content = content.replace(/"id":\s*"[^"]*"/, `"id": "${brandId}"`);
  content = content.replace(/"displayName":\s*"[^"]*"/, `"displayName": "${displayName}"`);
  content = content.replace(/"en":\s*"Template Brand"/, `"en": "${displayName}"`);
  fs.writeFileSync(brandJsonPath, content, 'utf8');
}

// Customize assets-manifest.json
const manifestPath = path.resolve(targetDir, 'assets-manifest.json');
if (fs.existsSync(manifestPath)) {
  let content = fs.readFileSync(manifestPath, 'utf8');
  content = content.replace(/"brandId":\s*"[^"]*"/, `"brandId": "${brandId}"`);
  fs.writeFileSync(manifestPath, content, 'utf8');
}

// Customize BRAND.md
const brandMdPath = path.resolve(targetDir, 'BRAND.md');
if (fs.existsSync(brandMdPath)) {
  let content = fs.readFileSync(brandMdPath, 'utf8');
  content = content.replaceAll('__TEMPLATE_DISPLAY_NAME__', displayName);
  content = content.replaceAll('__TEMPLATE_ID__', brandId);
  fs.writeFileSync(brandMdPath, content, 'utf8');
}

// Customize CHANGELOG.md
const changelogPath = path.resolve(targetDir, 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  let content = fs.readFileSync(changelogPath, 'utf8');
  content = content.replaceAll('__TEMPLATE_DISPLAY_NAME__', displayName);
  fs.writeFileSync(changelogPath, content, 'utf8');
}

// Customize catalog/product.json
const productJsonPath = path.resolve(targetDir, 'catalog/product.json');
if (fs.existsSync(productJsonPath)) {
  let content = fs.readFileSync(productJsonPath, 'utf8');
  content = content.replaceAll('__TEMPLATE_DISPLAY_NAME__', displayName);
  fs.writeFileSync(productJsonPath, content, 'utf8');
}

console.log(`PASS: Brand "${brandId}" successfully created at:`);
console.log(`  ${targetDir}`);
process.exit(0);
