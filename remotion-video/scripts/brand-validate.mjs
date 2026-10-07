import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const brandId = args[0];

if (!brandId) {
  console.error('Error: Brand ID is required. Usage: npm run brand:validate <id>');
  process.exit(1);
}

const brandJsonPath = path.resolve(repoRoot, 'brands', brandId, 'brand.json');

if (!fs.existsSync(brandJsonPath)) {
  console.error(`Error: brand.json not found at: ${brandJsonPath}`);
  process.exit(1);
}

let brandData;
try {
  brandData = JSON.parse(fs.readFileSync(brandJsonPath, 'utf8'));
} catch (err) {
  console.error(`Error: Failed to parse brand.json as JSON: ${err.message}`);
  process.exit(1);
}

// Brand Schema matching src/schema/brand.ts
const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a 6-digit hex color (#RRGGBB)');
const Str = z.string().min(1, 'String cannot be empty');
const Bcp47Lang = z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/, 'Must be a valid BCP-47 language tag');
const PerLang = z.record(z.string());
const Availability = z.enum(['live', 'beta', 'roadmap']);
const Source = z.enum(['provided', 'derived', 'assumed']);

const Contact = z.object({
  name: Str,
  role: Str,
  email: z.string().optional(),
  phone: z.string().optional(),
  isApprover: z.boolean(),
});

const Persona = z.object({
  name: Str,
  description: Str,
  ageRange: z.string().optional(),
  languages: z.array(Str).min(1),
  techComfort: z.enum(['low', 'medium', 'high']),
  channels: z.array(Str),
  pains: z.array(Str),
  desires: z.array(Str),
  objections: z.array(Str),
});

const Logo = z.object({
  name: Str,
  file: Str,
  background: z.enum(['light', 'dark', 'any', 'brand']),
  minWidthPx: z.number().int().positive(),
  clearSpace: Str,
});

const FontRole = z.object({
  role: z.enum(['display', 'heading', 'body', 'ui', 'numerals', 'accent']),
  script: z.enum(['latin', 'devanagari', 'other']),
  family: Str,
  weights: z.array(z.number().int()).min(1),
  source: z.enum(['google', 'client-licensed', 'system', 'custom']),
  licenseStatus: z.enum(['open', 'client-licensed', 'unknown']),
  fallbacks: z.array(Str),
});

const BrandSchema = z.object({
  schemaVersion: z.literal('1.0', { errorMap: () => ({ message: 'schemaVersion must be "1.0"' }) }),
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must match /^[a-z0-9-]+$/'),
  displayName: Str,
  legalName: z.string().optional(),
  status: z.enum(['draft', 'review', 'locked']),
  version: Str,
  lockedOn: z.string().optional(),
  project: z.object({
    goal: Str,
    deadline: z.string().optional(),
    deliverables: z.array(Str).min(1),
    successMeasures: z.array(Str),
  }),
  contacts: z.array(Contact).min(1),
  business: z.object({
    industry: Str,
    offering: Str,
    usp: z.array(Str).min(1),
    markets: z.array(Str),
    stage: z.string().optional(),
    pricePosition: z.string().optional(),
    competitors: z.array(Str),
  }),
  audience: z.object({
    primary: Persona,
    secondary: Persona.optional(),
  }),
  strategy: z.object({
    mission: z.string().optional(),
    values: z.array(Str),
    positioning: Str,
    personality: z.array(Str).min(3).max(5),
    notThis: z.array(Str),
    taglines: PerLang,
    story: z.string().optional(),
  }),
  identity: z.object({
    logos: z.array(Logo).min(1),
    logoDonts: z.array(Str),
    animatedLogoFile: z.string().optional(),
  }),
  colors: z.object({
    primary: Hex,
    secondary: Hex.optional(),
    accent: Hex.optional(),
    neutrals: z.array(Hex),
    background: z.object({
      light: Hex,
      dark: Hex,
    }),
    semantic: z.object({
      success: Hex,
      warning: Hex,
      error: Hex,
      info: Hex,
    }).partial(),
    usageRatio: z.string().optional(),
    gradientsAllowed: z.boolean(),
    gradients: z.array(z.object({
      name: Str,
      stops: z.array(Hex).min(2),
      angle: z.number(),
    })),
    forbidden: z.array(Str),
    contrastMin: z.number().min(4.5),
  }),
  typography: z.object({
    families: z.array(FontRole).min(1),
    scale: z.record(z.number()),
    caseRules: z.string(),
    letterSpacingLatin: z.number(),
    devanagariLineHeightMin: z.number().min(1.4),
  }),
  layout: z.object({
    grid: z.object({
      columns: z.number().int(),
      margin: z.number(),
      gutter: z.number(),
    }),
    radii: z.object({
      small: z.number(),
      medium: z.number(),
      large: z.number(),
    }),
    shadows: z.string(),
    borders: z.string(),
    spacingUnit: z.number(),
    iconStyle: z.enum(['outline', 'solid', 'duotone', 'custom']),
    patterns: z.array(Str),
  }),
  imagery: z.object({
    photoStyle: z.string(),
    illustrationStyle: z.string(),
    colorGrade: z.string(),
    subjects: z.array(Str),
    avoid: z.array(Str),
    mascot: z.object({
      exists: z.boolean(),
      file: z.string().optional(),
      rules: z.string().optional(),
    }),
  }),
  productUI: z.object({
    hasSoftwareProduct: z.boolean(),
    platforms: z.array(z.enum(['web', 'ios', 'android', 'desktop'])),
    theme: z.enum(['light', 'dark', 'both']),
    designSystemRef: z.string().optional(),
    fontsInUI: z.array(Str),
    screens: z.array(z.object({
      key: Str,
      name: Str,
      availability: Availability,
      screenshot: z.string().optional(),
      blurRules: z.string().optional(),
    })),
    sampleDataRules: z.string(),
  }),
  offering: z.object({
    items: z.array(z.object({
      name: Str,
      price: z.string().optional(),
      photo: z.string().optional(),
    })),
    locations: z.array(Str),
    packaging: z.string().optional(),
  }),
  motion: z.object({
    personality: z.enum(['calm', 'confident', 'playful', 'energetic', 'premium-minimal']),
    pace: z.enum(['slow', 'medium', 'fast']),
    easingFeel: z.enum(['soft', 'snappy', 'bouncy', 'mechanical']),
    cameraStyle: z.enum(['static', 'gentle-drift', 'dynamic']),
    allowedTransitions: z.array(Str),
    forbiddenTransitions: z.array(Str),
    use3D: z.boolean(),
    useCharacters: z.boolean(),
    textAnimation: z.enum(['word', 'line', 'fade']),
    maxSimultaneousText: z.number().int(),
  }),
  sound: z.object({
    music: z.object({
      moods: z.array(Str),
      bpmRange: z.tuple([z.number(), z.number()]),
      instruments: z.array(Str),
      avoid: z.array(Str),
      licensedTracks: z.array(Str),
    }),
    sfxStyle: z.string(),
    sonicLogoFile: z.string().optional(),
    voice: z.object({
      persona: Str,
      gender: z.enum(['female', 'male', 'neutral', 'any']),
      ageFeel: z.string(),
      accent: z.string(),
      pace: z.enum(['slow', 'medium', 'fast']),
      cloningConsentOnFile: z.boolean(),
    }),
    forbiddenSounds: z.array(Str),
  }),
  localization: z.object({
    languages: z.array(Bcp47Lang).min(1),
    primaryLanguage: Bcp47Lang,
    formality: z.enum(['formal', 'neutral', 'casual']),
    transcreate: z.boolean(),
    loanwordPolicy: z.string(),
    numberLocale: Str,
    currency: Str,
    dateFormat: z.string(),
    glossary: z.array(z.object({
      term: Str,
      translations: PerLang,
      doNotTranslate: z.boolean(),
    })),
    pronunciations: z.array(z.object({
      term: Str,
      lang: Bcp47Lang,
      say: Str,
    })),
    brandNameByLanguage: PerLang,
    reviewers: z.array(Str),
  }),
  messaging: z.object({
    pillars: z.array(Str).max(4),
    proofPoints: z.array(z.object({
      claim: Str,
      evidence: Str,
      sourceRef: z.string().optional(),
      approved: z.boolean(),
    })),
    allowedClaims: z.array(Str),
    prohibitedClaims: z.array(Str),
    disclaimers: z.array(z.object({
      text: Str,
      whenRequired: Str,
    })),
    ctas: z.array(z.object({
      text: PerLang,
      destination: Str,
    })),
    handles: z.array(Str),
    hashtags: z.array(Str),
  }),
  references: z.object({
    likes: z.array(z.object({
      ref: Str,
      why: Str,
    })),
    dislikes: z.array(z.object({
      ref: Str,
      why: Str,
    })),
  }),
  deliverables: z.object({
    formats: z.array(z.enum(['9:16', '4:5', '1:1', '16:9'])),
    durationsSeconds: z.array(z.number()),
    quantity: z.number().int(),
    platforms: z.array(Str),
    burnedCaptions: z.boolean(),
    languages: z.array(Bcp47Lang),
  }),
  assets: z.object({
    provided: z.array(z.object({
      type: Str,
      path: Str,
      owner: z.enum(['client', 'third-party', 'studio']),
      licenseNote: z.string().optional(),
    })),
    missing: z.array(Str),
  }),
  compliance: z.object({
    regulations: z.array(Str),
    testimonialConsentOnFile: z.boolean(),
    trademarkNotes: z.string().optional(),
    aiDisclosure: z.enum(['none', 'label-synthetic-voice', 'label-all-ai']),
    usageRights: z.object({
      territory: Str,
      durationMonths: z.number().int().optional(),
      paidMedia: z.boolean(),
    }),
    forbiddenTopics: z.array(Str),
    competitorMentionAllowed: z.boolean(),
  }),
  workflow: z.object({
    approvers: z.array(Str).min(1),
    revisionRounds: z.number().int(),
    reviewTool: z.string().optional(),
    signoffFormat: z.enum(['email', 'signed-form', 'tool']),
    confidentiality: z.enum(['standard', 'nda', 'restricted-local-llm-only']),
  }),
  provenance: z.record(Source),
});

const result = BrandSchema.safeParse(brandData);

if (!result.success) {
  console.error(`\nFAIL: Brand validation failed for "${brandId}":`);
  console.error('Validation errors (path -> rule failed):');
  const errorTable = result.error.issues.map((issue) => ({
    Path: issue.path.join('.') || '(root)',
    Code: issue.code,
    Message: issue.message,
  }));
  console.table(errorTable);
  process.exit(1);
}

console.log(`PASS: Brand "${brandId}" is valid:`);
console.log(`  Schema Version: ${result.data.schemaVersion}`);
console.log(`  Display Name:   ${result.data.displayName}`);
console.log(`  Status:         ${result.data.status}`);
console.log(`  Version:        ${result.data.version}`);
console.log(`  Languages:      ${result.data.localization.languages.join(', ')}`);
process.exit(0);
