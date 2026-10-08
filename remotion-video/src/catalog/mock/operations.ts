// src/catalog/mock/operations.ts
// Realistic Indian mock data for Group 2: Operations UI clones (CAT-07)

export interface MockKdsTicketItem {
  name: string;
  qty: number;
  notes?: string;
  completed: boolean;
}

export interface MockKdsTicketData {
  id: string;
  token: string;
  table: string;
  station: string;
  server: string;
  elapsed: string;
  urgent: boolean;
  items: MockKdsTicketItem[];
  isRoadmap?: boolean;
}

export interface MockOrderItem {
  name: string;
  qty: number;
  tag: 'veg' | 'non-veg';
  price: number;
}

export interface MockOrderData {
  id: string;
  table: string;
  timeAgo: string;
  status: 'waiting_accept' | 'preparing' | 'ready';
  token: string;
  total: number;
  items: MockOrderItem[];
  notes?: string;
  isRoadmap?: boolean;
}

export interface MockBillingData {
  table: string;
  billNumber: string;
  party: string;
  duration: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  itemsCount: number;
  paymentMode?: 'UPI' | 'Cash' | 'Card';
  isRoadmap?: boolean;
}

export interface MockWaitlistQueueItem {
  id: string;
  token: string;
  guestName: string;
  partySize: number;
  waitMinutes: number;
  status: 'WAITING' | 'TABLE_ASSIGNED';
  assignedTable?: string;
}

export interface MockWaitlistManagementData {
  sectionName: string;
  activeCount: number;
  avgWaitMins: number;
  entries: MockWaitlistQueueItem[];
  isRoadmap?: boolean;
}

export interface MockAlertItem {
  id: string;
  type: 'access_request' | 'occupied_scan' | 'bill_assistance';
  table: string;
  message: string;
  timeAgo: string;
  urgent: boolean;
}

export interface MockAlertsData {
  branchName: string;
  urgentCount: number;
  alerts: MockAlertItem[];
  isRoadmap?: boolean;
}

export const MOCK_KDS_TICKETS: Record<string, MockKdsTicketData> = {
  regular: {
    id: 'TICKET-1',
    token: 'KOT #42',
    table: 'Table T3',
    station: 'Main Kitchen',
    server: 'Amit (Captain)',
    elapsed: '04:15',
    urgent: false,
    items: [
      { name: 'Paneer Butter Masala', qty: 1, notes: 'Medium spicy', completed: false },
      { name: 'Butter Naan', qty: 3, notes: 'Crispy', completed: false },
      { name: 'Jeera Rice', qty: 1, notes: '', completed: true },
    ],
  },
  urgent: {
    id: 'TICKET-2',
    token: 'KOT #41',
    table: 'Table T1',
    station: 'Main Kitchen',
    server: 'Vikram (Captain)',
    elapsed: '14:40',
    urgent: true,
    items: [
      { name: 'Chicken Tikka Kebab', qty: 1, notes: 'Well done', completed: false },
      { name: 'Garlic Naan', qty: 2, notes: '', completed: false },
      { name: 'Fresh Lime Soda', qty: 2, notes: 'Sweet & salt', completed: true },
    ],
  },
};

export const MOCK_OPERATION_ORDERS: Record<string, MockOrderData> = {
  preparing: {
    id: 'ORD-102',
    table: 'Table T1',
    timeAgo: '18 mins ago',
    status: 'preparing',
    token: 'KOT #41',
    total: 840,
    items: [
      { name: 'Chicken Tikka Kebab', qty: 1, tag: 'non-veg', price: 420 },
      { name: 'Garlic Naan', qty: 2, tag: 'veg', price: 180 },
      { name: 'Fresh Lime Soda', qty: 2, tag: 'veg', price: 240 },
    ],
    notes: 'Serve starters first',
  },
  ready: {
    id: 'ORD-103',
    table: 'Table T4',
    timeAgo: '6 mins ago',
    status: 'ready',
    token: 'KOT #44',
    total: 650,
    items: [
      { name: 'Dal Makhani', qty: 1, tag: 'veg', price: 320 },
      { name: 'Tandoori Roti', qty: 4, tag: 'veg', price: 160 },
      { name: 'Gulab Jamun (2 pcs)', qty: 1, tag: 'veg', price: 170 },
    ],
  },
};

export const MOCK_BILLS: Record<string, MockBillingData> = {
  default: {
    table: 'Table T3',
    billNumber: 'INV-2026-0842',
    party: 'Party of 5',
    duration: '42m',
    subtotal: 2333,
    cgst: 58.33,
    sgst: 58.33,
    total: 2450,
    itemsCount: 8,
    paymentMode: 'UPI',
  },
};

export const MOCK_WAITLIST_MANAGEMENT: Record<string, MockWaitlistManagementData> = {
  default: {
    sectionName: 'Ground Floor AC Hall',
    activeCount: 4,
    avgWaitMins: 20,
    entries: [
      { id: 'wl-1', token: 'WL-08', guestName: 'Aarav Deshmukh', partySize: 3, waitMinutes: 16, status: 'TABLE_ASSIGNED', assignedTable: 'T2' },
      { id: 'wl-2', token: 'WL-09', guestName: 'Ananya Iyer', partySize: 2, waitMinutes: 12, status: 'WAITING' },
      { id: 'wl-3', token: 'WL-10', guestName: 'Kabir Mehta', partySize: 6, waitMinutes: 8, status: 'WAITING' },
      { id: 'wl-4', token: 'WL-11', guestName: 'Sneha Patil', partySize: 4, waitMinutes: 2, status: 'WAITING' },
    ],
  },
};

export const MOCK_ALERTS: Record<string, MockAlertsData> = {
  default: {
    branchName: 'Swad Sagar Pure Veg',
    urgentCount: 3,
    alerts: [
      { id: 'alt-1', type: 'access_request', table: 'Table T4', message: 'New guest requesting access to active session', timeAgo: '2m ago', urgent: true },
      { id: 'alt-2', type: 'occupied_scan', table: 'Table T7', message: 'Walk-in guest scanned already occupied table', timeAgo: '4m ago', urgent: true },
      { id: 'alt-3', type: 'bill_assistance', table: 'Table T3', message: 'Customer requested UPI settlement assistance', timeAgo: '7m ago', urgent: false },
    ],
  },
};
