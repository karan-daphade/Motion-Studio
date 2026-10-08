// src/components/clones/WaitlistManagementPanel/WaitlistManagementPanel.schema.ts
import { z } from 'zod';

export const WaitlistEntryItemSchema = z.object({
  id: z.string(),
  token: z.string(),
  guestName: z.string(),
  partySize: z.number().int().positive(),
  waitMinutes: z.number().int().nonnegative(),
  status: z.enum(['WAITING', 'TABLE_ASSIGNED']),
  assignedTable: z.string().optional(),
});

export const WaitlistManagementPanelPropsSchema = z.object({
  sectionName: z.string(),
  activeCount: z.number().int().nonnegative(),
  avgWaitMins: z.number().int().nonnegative(),
  entries: z.array(WaitlistEntryItemSchema),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  isRoadmap: z.boolean().default(false),
  frame: z.number().optional(),
});

export type WaitlistManagementPanelProps = z.input<typeof WaitlistManagementPanelPropsSchema>;
