// src/components/clones/QueueRegistration/QueueRegistration.schema.ts
import { z } from 'zod';

export const QueueRegistrationPropsSchema = z.object({
  restaurantName: z.string(),
  branchName: z.string(),
  sectionName: z.string(),
  currentQueueLength: z.number().int().nonnegative(),
  averageWaitMinutes: z.number().int().nonnegative(),
  selectedPartySize: z.number().int().positive().default(4),
  guestNameMock: z.string().optional(),
  mobileNumberMock: z.string().optional(),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  isRoadmap: z.boolean().default(false),
  frame: z.number().optional(),
});

export type QueueRegistrationProps = z.input<typeof QueueRegistrationPropsSchema>;
