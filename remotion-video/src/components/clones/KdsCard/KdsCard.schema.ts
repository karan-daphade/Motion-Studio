// src/components/clones/KdsCard/KdsCard.schema.ts
import { z } from 'zod';

export const KdsItemSchema = z.object({
  name: z.string(),
  qty: z.number().int().positive(),
  notes: z.string().optional(),
  completed: z.boolean(),
});

export const KdsCardPropsSchema = z.object({
  id: z.string(),
  token: z.string(),
  table: z.string(),
  station: z.string(),
  server: z.string(),
  elapsed: z.string(),
  urgent: z.boolean().default(false),
  items: z.array(KdsItemSchema),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  isRoadmap: z.boolean().default(false),
  frame: z.number().optional(),
});

export type KdsCardProps = z.input<typeof KdsCardPropsSchema>;
