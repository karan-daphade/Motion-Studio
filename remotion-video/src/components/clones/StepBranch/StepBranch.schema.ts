import { z } from 'zod';

export const StepBranchPropsSchema = z.object({
  name: z.string().default('Spice Garden — Indiranagar Outlet'),
  phone: z.string().default('9876543210'),
  address: z.string().default('Plot 42, 100 Feet Road, HAL 2nd Stage'),
  city: z.string().default('Bengaluru'),
  state: z.string().default('Karnataka'),
  pinCode: z.string().default('560038'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  googleMapsUrl: z.string().optional(),
  managerName: z.string().default('Rajesh Sharma'),
  managerPhone: z.string().default('9823456789'),
  gstin: z.string().optional(),
  googleReviewLink: z.string().optional(),
  isSaving: z.boolean().default(false),
  isFirstBranch: z.boolean().default(false),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  frame: z.number().int().optional(),
});

export type StepBranchProps = z.input<typeof StepBranchPropsSchema>;
