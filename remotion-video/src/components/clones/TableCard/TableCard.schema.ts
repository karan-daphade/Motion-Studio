// src/components/clones/TableCard/TableCard.schema.ts
import { z } from 'zod';

export const TableCardPropsSchema = z.object({
  tableNumber: z.string(),
  shortCode: z.string().optional(),
  section: z.string(),
  capacity: z.number().int().positive(),
  status: z.enum(['vacant', 'assigned', 'occupied', 'reserved']),
  durationText: z.string().optional(),
  assignedGuest: z
    .object({
      name: z.string(),
      token: z.string(),
      guestCount: z.number().int().positive(),
    })
    .optional(),
  bill: z
    .object({
      totalAmount: z.number().nonnegative(),
      paidAmount: z.number().nonnegative(),
      dueAmount: z.number().nonnegative(),
    })
    .optional(),
  orderSummary: z
    .object({
      preparingCount: z.number().int().nonnegative(),
      readyCount: z.number().int().nonnegative(),
    })
    .optional(),
  deviceCount: z.number().int().nonnegative().optional(),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  isRoadmap: z.boolean().default(false),
  frame: z.number().optional(),
});

export type TableCardProps = z.input<typeof TableCardPropsSchema>;
