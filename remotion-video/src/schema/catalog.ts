// src/schema/catalog.ts

import { z } from 'zod';

export const Lang = z.enum(['en', 'hi', 'mr']);

export const LocaleCopy = z.object({
  title: z.string().max(48),
  sub: z.string().max(90),
  reviewedBy: z.string().optional(),
  reviewedOn: z.string().optional(),
});

export const Feature = z.object({
  key: z.string(), // e.g. 'qr_ordering'
  category: z.enum([
    'Customer Experience',
    'Operations',
    'Billing',
    'Setup',
    'Insights',
  ]),
  availability: z.enum(['live', 'beta', 'roadmap']),
  uiComponent: z.string(), // component registered in components/
  mockData: z.record(z.any()), // props passed to the UI component
  heroMetric: z
    .object({
      value: z.string(),
      label: Lang.optional(),
    })
    .optional(),
  locales: z.record(LocaleCopy), // locales keyed by Lang: en, hi, mr, ...
  voiceover: z.record(z.string()).optional(), // script lines per language
  sfxCues: z
    .array(
      z.object({
        frame: z.number(),
        sfx: z.string(),
      })
    )
    .optional(),
  hooks: z.array(z.string()).optional(), // A/B hook variants
});

export type LangType = z.infer<typeof Lang>;
export type LocaleCopyType = z.infer<typeof LocaleCopy>;
export type FeatureType = z.infer<typeof Feature>;
