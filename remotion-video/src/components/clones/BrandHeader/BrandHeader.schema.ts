import { z } from 'zod';

export const BrandHeaderPropsSchema = z.object({
  appName: z.string().default('Spice Garden'),
  roleName: z.string().default('Owner Setup'),
  currentBranch: z.string().optional(),
  userName: z.string().default('Rajesh Sharma'),
  userEmail: z.string().default('owner@spicegarden.in'),
  showBackToHub: z.boolean().default(true),
  hasActiveBranch: z.boolean().default(true),
  notificationCount: z.number().int().default(1),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  frame: z.number().int().optional(),
});

export type BrandHeaderProps = z.input<typeof BrandHeaderPropsSchema>;
