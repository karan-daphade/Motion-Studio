import { z } from 'zod';

export const StepItemSchema = z.object({
  step: z.number().int().positive(),
  name: z.string(),
  shortDesc: z.string(),
});

export const OnboardingStepperPropsSchema = z.object({
  currentStep: z.number().int().min(1).default(1),
  completedSteps: z.array(z.number().int()).default([]),
  totalSteps: z.number().int().default(7),
  steps: z.array(StepItemSchema).optional(),
  isSaving: z.boolean().default(false),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  frame: z.number().int().optional(),
});

export type OnboardingStepperProps = z.input<typeof OnboardingStepperPropsSchema>;
export type StepItem = z.infer<typeof StepItemSchema>;
