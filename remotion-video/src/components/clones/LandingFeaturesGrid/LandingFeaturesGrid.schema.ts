import { z } from 'zod';

export const FeatureCardSchema = z.object({
  id: z.string(),
  badge: z.string(),
  title: z.string(),
  description: z.string(),
});

export const LandingFeaturesGridPropsSchema = z.object({
  badge: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  features: z.array(FeatureCardSchema).optional(),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  frame: z.number().int().optional(),
});

export type LandingFeaturesGridProps = z.input<typeof LandingFeaturesGridPropsSchema>;
export type FeatureCard = z.infer<typeof FeatureCardSchema>;
