// src/components/clones/JoinSession/JoinSession.schema.ts
import { z } from 'zod';

export const JoinSessionPropsSchema = z.object({
  restaurantName: z.string(),
  branchName: z.string(),
  tableLabel: z.string(),
  currentDinersCount: z.number().int().positive(),
  existingSessionDuration: z.string(),
  guestNameMock: z.string().optional(),
  mobileNumberMock: z.string().optional(),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  isRoadmap: z.boolean().default(false),
  frame: z.number().optional(),
});

export type JoinSessionProps = z.input<typeof JoinSessionPropsSchema>;
