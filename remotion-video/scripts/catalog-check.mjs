import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const brandId = args.find((a) => !a.startsWith('--'));

let mode = 'preview';
const modeArg = args.find((a) => a.startsWith('--mode='));
if (modeArg) {
  mode = modeArg.split('=')[1];
} else if (args.includes('--mode') && args[args.indexOf('--mode') + 1]) {
  mode = args[args.indexOf('--mode') + 1];
}

if (!['preview', 'release'].includes(mode)) {
  console.error(`Error: Invalid mode "${mode}". Must be "preview" or "release".`);
  process.exit(1);
}

if (!brandId) {
  console.error('Error: Brand ID is required. Usage: npm run catalog:check <id> -- --mode=preview|release');
  process.exit(1);
}

const brandDir = path.resolve(repoRoot, 'brands', brandId);
const brandJsonPath = path.resolve(brandDir, 'brand.json');
const productJsonPath = path.resolve(brandDir, 'catalog/product.json');
const featuresJsonPath = path.resolve(brandDir, 'catalog/features.json');

if (!fs.existsSync(brandJsonPath)) {
  console.error(`Error: Missing brand.json at ${brandJsonPath}`);
  process.exit(1);
}
if (!fs.existsSync(productJsonPath)) {
  console.error(`Error: Missing catalog/product.json at ${productJsonPath}`);
  process.exit(1);
}
if (!fs.existsSync(featuresJsonPath)) {
  console.error(`Error: Missing catalog/features.json at ${featuresJsonPath}`);
  process.exit(1);
}

const brandData = JSON.parse(fs.readFileSync(brandJsonPath, 'utf8'));
const productData = JSON.parse(fs.readFileSync(productJsonPath, 'utf8'));
const featuresData = JSON.parse(fs.readFileSync(featuresJsonPath, 'utf8'));

console.log(`\n--- Motion Studio Catalog Check ---`);
console.log(`Brand: ${brandId}`);
console.log(`Mode:  ${mode.toUpperCase()}\n`);

// 1. Validate Product Schema (CAT-01, CAT-02)
const ProductSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  palette: z.record(z.string()),
  cta: z.record(z.string()),
  logo: z.object({
    svg: z.string(),
    sting: z.string(),
  }),
});

const productResult = ProductSchema.safeParse(productData);
if (!productResult.success) {
  console.error('FAIL: product.json failed schema validation:');
  console.table(productResult.error.issues.map(i => ({ Path: i.path.join('.'), Message: i.message })));
  process.exit(1);
}
console.log('✓ product.json matches schema.');

// 2. Validate Features Schema (CAT-01, CAT-03, CAT-06)
const LocaleCopySchema = z.object({
  title: z.string().max(48, 'Title exceeds max 48 characters (CAT-06)'),
  sub: z.string().max(90, 'Sub exceeds max 90 characters (CAT-06)'),
  reviewedBy: z.string().optional(),
  reviewedOn: z.string().optional(),
});

const FeatureSchema = z.object({
  key: z.string().min(1),
  category: z.enum([
    'Customer Experience',
    'Operations',
    'Billing',
    'Setup',
    'Insights',
  ]),
  availability: z.enum(['live', 'beta', 'roadmap']),
  uiComponent: z.string().min(1),
  mockData: z.record(z.any()),
  heroMetric: z.object({ value: z.string(), label: z.string().optional() }).optional(),
  locales: z.record(LocaleCopySchema),
  voiceover: z.record(z.string()).optional(),
  sfxCues: z.array(z.object({ frame: z.number(), sfx: z.string() })).optional(),
  hooks: z.array(z.string()).optional(),
});

const featuresArraySchema = z.array(FeatureSchema).min(1);
const featuresResult = featuresArraySchema.safeParse(featuresData);
if (!featuresResult.success) {
  console.error('FAIL: features.json failed schema validation:');
  console.table(featuresResult.error.issues.map(i => ({ Path: i.path.join('.'), Message: i.message })));
  process.exit(1);
}
console.log(`✓ features.json matches schema (${featuresData.length} features present).`);

// 3. Language Completeness Gate (CAT-04, BRD-24)
const targetLanguages = brandData.localization?.languages || ['en'];
let hasLanguageErrors = false;
let hasUnreviewedLanguages = false;
const unreviewedIssues = [];

for (const feat of featuresData) {
  for (const lang of targetLanguages) {
    const locale = feat.locales?.[lang];
    if (!locale) {
      console.error(`ERROR (CAT-04): Feature "${feat.key}" missing copy for language "${lang}".`);
      hasLanguageErrors = true;
      continue;
    }

    // Check review status (Hinglish/Marathi transcreation review gate)
    if (lang === 'en') continue;
    const isReviewed = Boolean(locale.reviewedBy && locale.reviewedOn);
    if (!isReviewed) {
      unreviewedIssues.push({ feature: feat.key, lang });
      hasUnreviewedLanguages = true;
    }
  }
}

if (hasLanguageErrors) {
  console.error('\nFAIL: Missing locale copy detected. All target languages must be present.');
  process.exit(1);
}
console.log(`✓ All ${featuresData.length} features have complete copy for all brand languages: [${targetLanguages.join(', ')}].`);

// 4. Mock Data Audit (CAT-07: no lorem ipsum, realistic data)
const LOREM_PATTERN = /lorem|ipsum|dolor|sit amet|foo|bar|baz|john doe|jane doe/i;
let hasLoremError = false;

for (const feat of featuresData) {
  const mockStr = JSON.stringify(feat.mockData);
  if (LOREM_PATTERN.test(mockStr)) {
    console.error(`ERROR (CAT-07): Feature "${feat.key}" mock data contains placeholder/lorem text: ${mockStr}`);
    hasLoremError = true;
  }
}

if (hasLoremError) {
  console.error('\nFAIL: Mock data contains prohibited placeholder or lorem ipsum text.');
  process.exit(1);
}
console.log('✓ Mock data audit passed (no lorem ipsum or placeholder text).');

// 5. Review Gate Handling (CAT-04: preview vs release)
if (hasUnreviewedLanguages) {
  const unreviewedLangs = [...new Set(unreviewedIssues.map(u => u.lang))];
  if (mode === 'release') {
    console.error(`\nFAIL: Release blocked (CAT-04)! Unreviewed copy in languages: [${unreviewedLangs.join(', ')}].`);
    console.error('The following features have unreviewed strings:');
    console.table(unreviewedIssues);
    process.exit(1);
  } else {
    console.warn(`\n[WARNING] Preview mode: Detected unreviewed copy in languages [${unreviewedLangs.join(', ')}].`);
    console.warn(`(${unreviewedIssues.length} feature-language combinations pending native review). Allowed for preview.`);
  }
} else {
  console.log('✓ All language strings are reviewed and locked.');
}

console.log(`\nPASS: Catalog check completed successfully in ${mode.toUpperCase()} mode.`);
process.exit(0);
