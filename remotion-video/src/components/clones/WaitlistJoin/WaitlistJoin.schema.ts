// src/components/clones/WaitlistJoin/WaitlistJoin.schema.ts
import { z } from 'zod';

export const WaitlistJoinPropsSchema = z.object({
  restaurantName: z.string(),
  branchName: z.string(),
  sectionName: z.string(),
  tokenNumber: z.string(),
  guestName: z.string(),
  partySize: z.number().int().positive(),
  position: z.number().int().positive(),
  partiesAhead: z.number().int().nonnegative(),
  estimatedWaitMinutes: z.number().int().nonnegative(),
  status: z.enum(['WAITING', 'TABLE_ASSIGNED', 'SEATED']),
  assignedTableLabel: z.string().optional(),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  isRoadmap: z.boolean().default(false),
  frame: z.number().optional(),
});

export type WaitlistJoinProps = z.input<typeof WaitlistJoinPropsSchema>;
