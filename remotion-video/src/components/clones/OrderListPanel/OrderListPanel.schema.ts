// src/components/clones/OrderListPanel/OrderListPanel.schema.ts
import { z } from 'zod';

export const OrderItemSchema = z.object({
  name: z.string(),
  qty: z.number().int().positive(),
  tag: z.enum(['veg', 'non-veg']),
  price: z.number().nonnegative(),
});

export const OrderListPanelPropsSchema = z.object({
  id: z.string(),
  table: z.string(),
  timeAgo: z.string(),
  status: z.enum(['waiting_accept', 'preparing', 'ready']),
  token: z.string(),
  total: z.number().nonnegative(),
  items: z.array(OrderItemSchema),
  notes: z.string().optional(),
  locale: z.enum(['en', 'hi', 'mr']).default('en'),
  isRoadmap: z.boolean().default(false),
  frame: z.number().optional(),
});

export type OrderListPanelProps = z.input<typeof OrderListPanelPropsSchema>;
