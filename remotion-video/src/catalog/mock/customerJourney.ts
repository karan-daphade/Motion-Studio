// src/catalog/mock/customerJourney.ts
// Realistic Indian mock data for Group 1: Customer Journey UI clones (CAT-07)

export interface MockTableCardData {
  tableNumber: string;
  shortCode?: string;
  section: string;
  capacity: number;
  status: 'vacant' | 'assigned' | 'occupied' | 'reserved';
  durationText?: string;
  assignedGuest?: {
    name: string;
    token: string;
    guestCount: number;
  };
  bill?: {
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
  };
  orderSummary?: {
    preparingCount: number;
    readyCount: number;
  };
  deviceCount?: number;
  isRoadmap?: boolean;
}

export interface MockTableQrScanData {
  tableLabel: string;
  seatingCapacity: number;
  branchName: string;
  branchCity?: string;
  sectionName: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'HELD';
  activeSessionGuestCount?: number;
  isRoadmap?: boolean;
}

export interface MockWaitlistJoinData {
  restaurantName: string;
  branchName: string;
  sectionName: string;
  tokenNumber: string;
  guestName: string;
  partySize: number;
  position: number;
  partiesAhead: number;
  estimatedWaitMinutes: number;
  status: 'WAITING' | 'TABLE_ASSIGNED' | 'SEATED';
  assignedTableLabel?: string;
  isRoadmap?: boolean;
}

export interface MockJoinSessionData {
  restaurantName: string;
  branchName: string;
  tableLabel: string;
  currentDinersCount: number;
  existingSessionDuration: string;
  isRoadmap?: boolean;
}

export interface MockQueueRegistrationData {
  restaurantName: string;
  branchName: string;
  sectionName: string;
  currentQueueLength: number;
  averageWaitMinutes: number;
  isRoadmap?: boolean;
}

export const MOCK_TABLE_CARDS: Record<string, MockTableCardData> = {
  vacant: {
    tableNumber: '4',
    shortCode: 'T4',
    section: 'Main Dining',
    capacity: 4,
    status: 'vacant',
  },
  assigned: {
    tableNumber: '2',
    shortCode: 'T2',
    section: 'Main Dining',
    capacity: 4,
    status: 'assigned',
    assignedGuest: {
      name: 'Aarav Deshmukh',
      token: 'WL-08',
      guestCount: 3,
    },
  },
  occupied: {
    tableNumber: '7',
    shortCode: 'T7',
    section: 'AC Hall',
    capacity: 6,
    status: 'occupied',
    durationText: '42m',
    bill: {
      totalAmount: 2450,
      paidAmount: 0,
      dueAmount: 2450,
    },
    orderSummary: {
      preparingCount: 2,
      readyCount: 3,
    },
    deviceCount: 2,
  },
  reserved: {
    tableNumber: '11',
    shortCode: 'T11',
    section: 'Garden',
    capacity: 8,
    status: 'reserved',
  },
};

export const MOCK_TABLE_QR_SCANS: Record<string, MockTableQrScanData> = {
  available: {
    tableLabel: 'Table 4',
    seatingCapacity: 4,
    branchName: 'Swad Sagar Pure Veg',
    branchCity: 'FC Road, Pune',
    sectionName: 'Main Dining',
    status: 'AVAILABLE',
  },
  occupied: {
    tableLabel: 'Table 7',
    seatingCapacity: 6,
    branchName: 'Cafe Deccan Heritage',
    branchCity: 'JM Road, Pune',
    sectionName: 'AC Hall',
    status: 'OCCUPIED',
    activeSessionGuestCount: 4,
  },
  held: {
    tableLabel: 'Table 12',
    seatingCapacity: 8,
    branchName: 'Spice Route Kitchen',
    branchCity: 'Bandra West, Mumbai',
    sectionName: 'Family Lounge',
    status: 'HELD',
  },
};

export const MOCK_WAITLIST_JOINS: Record<string, MockWaitlistJoinData> = {
  waiting: {
    restaurantName: 'Swad Sagar Pure Veg',
    branchName: 'FC Road Branch',
    sectionName: 'Main Dining',
    tokenNumber: 'WL-14',
    guestName: 'Vikram Malhotra',
    partySize: 4,
    position: 3,
    partiesAhead: 2,
    estimatedWaitMinutes: 18,
    status: 'WAITING',
  },
  tableAssigned: {
    restaurantName: 'Cafe Deccan Heritage',
    branchName: 'JM Road Branch',
    sectionName: 'AC Hall',
    tokenNumber: 'WL-09',
    guestName: 'Ananya Iyer',
    partySize: 2,
    position: 1,
    partiesAhead: 0,
    estimatedWaitMinutes: 0,
    status: 'TABLE_ASSIGNED',
    assignedTableLabel: 'Table 3',
  },
};

export const MOCK_JOIN_SESSIONS: Record<string, MockJoinSessionData> = {
  default: {
    restaurantName: 'Swad Sagar Pure Veg',
    branchName: 'FC Road Branch',
    tableLabel: 'Table 7',
    currentDinersCount: 3,
    existingSessionDuration: '28m',
  },
};

export const MOCK_QUEUE_REGISTRATIONS: Record<string, MockQueueRegistrationData> = {
  default: {
    restaurantName: 'Swad Sagar Pure Veg',
    branchName: 'FC Road Branch',
    sectionName: 'Ground Floor Dining',
    currentQueueLength: 5,
    averageWaitMinutes: 20,
  },
};
