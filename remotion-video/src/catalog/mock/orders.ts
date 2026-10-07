/**
 * Authentic restaurant orders, bills, queue tokens, and GST tax breakdowns.
 * CAT-07 compliance: INR amounts with Indian 5% restaurant GST (2.5% CGST + 2.5% SGST).
 */

export interface MockOrder {
  orderId: string;
  table: string;
  token: string;
  customerName: string;
  items: Array<{ name: string; qty: number; price: number }>;
  subtotal: number;
  cgst: number; // 2.5%
  sgst: number; // 2.5%
  total: number;
  status: 'Waiting' | 'Accepted' | 'Preparing' | 'Ready' | 'Completed';
  paymentMethod: 'UPI' | 'Card' | 'Cash';
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    orderId: 'ORD-8921',
    table: 'T-04',
    token: 'A-12',
    customerName: 'Aarav Deshmukh',
    items: [
      { name: 'Paneer Butter Masala', qty: 1, price: 280 },
      { name: 'Butter Naan', qty: 3, price: 150 },
      { name: 'Dal Makhani', qty: 1, price: 240 },
    ],
    subtotal: 670,
    cgst: 16.75,
    sgst: 16.75,
    total: 703.5,
    status: 'Accepted',
    paymentMethod: 'UPI',
  },
  {
    orderId: 'ORD-8922',
    table: 'T-12',
    token: 'B-04',
    customerName: 'Priya Patel',
    items: [
      { name: 'Masala Dosa', qty: 2, price: 240 },
      { name: 'South Indian Filter Coffee', qty: 2, price: 120 },
    ],
    subtotal: 360,
    cgst: 9,
    sgst: 9,
    total: 378,
    status: 'Ready',
    paymentMethod: 'UPI',
  },
];
