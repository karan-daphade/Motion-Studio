// src/components/clones/TableQrScan/TableQrScan.schema.ts
import { z } from 'zod';

export const TableQrScanPropsSchema = z.object({
  tableLabel: z.string(),
  seatingCapacity: z.number().int().positive(),
  branchName: z.string(),
  branchCity: z.string().optional(),
  sectionName: z.string(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'HELD']),
  activeSessionGuestCount: z.number().int().positive().optional(),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  isRoadmap: z.boolean().default(false),
  frame: z.number().optional(),
});

export type TableQrScanProps = z.input<typeof TableQrScanPropsSchema>;
