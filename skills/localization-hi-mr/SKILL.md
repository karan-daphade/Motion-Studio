---
name: localization-hi-mr
description: How to add or update Hindi (hi) and Marathi (mr) copy in the catalog, run the locale workflow, and verify output for a feature video.
---

# Skill: Localization — Hindi and Marathi

> Read `docs/requirements.md` sections 8.7 (LOC) and `docs/project.md` section 3 before any localization task.
> Also read the `devanagari-typography` skill before touching any Devanagari text in components.

## Catalog locale structure

Every feature entry in `catalog/features.json` has a `locales` key:

```json
{
  "key": "qr_ordering",
  "locales": {
    "en": {
      "title": "QR Ordering",
      "sub": "Let customers order from their phone"
    },
    "hi": {
      "title": "क्यूआर ऑर्डरिंग",
      "sub": "ग्राहक अपने फोन से ऑर्डर कर सकते हैं"
    },
    "mr": {
      "title": "क्यूआर ऑर्डरिंग",
      "sub": "ग्राहक त्यांच्या फोनवरून ऑर्डर करू शकतात"
    }
  }
}
```

Constraints: `title` max 48 chars, `sub` max 90 chars (validated by Zod schema).

## Locale workflow

1. Draft the English copy first and lock it (owner review).
2. Write Hindi and Marathi copy — keep idiomatic tone, not literal translation.
3. Run schema validation: `node -e "import('./src/schema/catalog.ts').then(s => console.log(s.Feature.parse(require('./catalog/features.json')[0])))"`.
4. Run `npm run typecheck` — any locale field overflow will fail via Zod.
5. Render a Devanagari still: `npx remotion still --composition=<id> --frame=30`.
6. **Native review gate** — per PRD open decision 3, a native speaker must review Hindi and Marathi copy before it ships. Log the reviewer name and date in `docs/decisions/`.

## Scene locale usage

Scenes receive a `lang` prop. Pull copy from the catalog — never hardcode:

```typescript
import type { LangType } from "../schema/catalog";

interface SceneProps {
  lang: LangType;
  feature: FeatureType;
}

// Inside render:
const copy = feature.locales[lang]; // { title, sub }
```

## Money formatting

Always use `Intl.NumberFormat` for Indian number formatting:

```typescript
const formatted = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(123456); // → ₹1,23,456
```

## Rules

- Never hardcode Hindi or Marathi strings in component files.
- Validate all locale strings against the Zod schema before committing.
- Devanagari animation is word-level only (see `devanagari-typography` skill).
- Native review is required before any video is published. Log it in `docs/decisions/`.
