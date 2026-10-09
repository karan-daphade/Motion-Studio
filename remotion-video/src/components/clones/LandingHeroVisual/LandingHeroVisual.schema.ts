import { z } from 'zod';

export const KitchenItemSchema = z.object({
  qty: z.number().int().positive(),
  name: z.string(),
  status: z.enum(['preparing', 'prep', 'ready', 'served']),
});

export const LandingHeroVisualPropsSchema = z.object({
  tableCode: z.string().default('T-04'),
  tableName: z.string().default('Table 4 — AC Dining Hall'),
  guestCount: z.number().int().default(3),
  runningBill: z.number().default(1420),
  mainKitchenItems: z.array(KitchenItemSchema).optional(),
  beverageItems: z.array(KitchenItemSchema).optional(),
  avgTurnaroundMins: z.number().default(8.4),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  frame: z.number().int().optional(),
});

export type LandingHeroVisualProps = z.input<typeof LandingHeroVisualPropsSchema>;
export type KitchenItem = z.infer<typeof KitchenItemSchema>;
