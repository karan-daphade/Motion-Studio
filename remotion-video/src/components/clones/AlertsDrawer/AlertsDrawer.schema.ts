// src/components/clones/AlertsDrawer/AlertsDrawer.schema.ts
import { z } from 'zod';

export const AlertItemSchema = z.object({
  id: z.string(),
  type: z.enum(['access_request', 'occupied_scan', 'bill_assistance']),
  table: z.string(),
  message: z.string(),
  timeAgo: z.string(),
  urgent: z.boolean().default(false),
});

export const AlertsDrawerPropsSchema = z.object({
  branchName: z.string(),
  urgentCount: z.number().int().nonnegative(),
  alerts: z.array(AlertItemSchema),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  isRoadmap: z.boolean().default(false),
  frame: z.number().optional(),
});

export type AlertsDrawerProps = z.input<typeof AlertsDrawerPropsSchema>;
