// src/components/clones/BillingSummary/BillingSummary.schema.ts
import { z } from 'zod';

export const BillingSummaryPropsSchema = z.object({
  table: z.string(),
  billNumber: z.string(),
  party: z.string(),
  duration: z.string(),
  subtotal: z.number().nonnegative(),
  cgst: z.number().nonnegative(),
  sgst: z.number().nonnegative(),
  total: z.number().nonnegative(),
  itemsCount: z.number().int().positive(),
  paymentMode: z.enum(['UPI', 'Cash', 'Card']).default('UPI'),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  isRoadmap: z.boolean().default(false),
  frame: z.number().optional(),
});

export type BillingSummaryProps = z.input<typeof BillingSummaryPropsSchema>;
