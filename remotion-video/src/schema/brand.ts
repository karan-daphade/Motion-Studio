// src/schema/brand.ts

import { z } from 'zod';
import { Lang } from './catalog';

export const Product = z.object({
  name: z.string(),
  domain: z.string(),
  palette: z.record(z.string()), // background, surface, primary, accent
  cta: z.record(Lang, z.string()),
  logo: z.object({ svg: z.string(), sting: z.string() }),
});

export type ProductType = z.infer<typeof Product>;
