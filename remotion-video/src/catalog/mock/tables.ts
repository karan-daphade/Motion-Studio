/**
 * Realistic Indian restaurant floor table mocks.
 * CAT-07 compliance: strictly Indian context, no generic placeholders.
 */

export interface MockTable {
  id: string;
  name: string;
  section: 'Main Dining' | 'Garden' | 'AC Hall' | 'Rooftop';
  capacity: number;
  status: 'occupied' | 'available' | 'reserved' | 'billing';
}

export const MOCK_TABLES: MockTable[] = [
  { id: 't-01', name: 'T-01', section: 'Main Dining', capacity: 2, status: 'available' },
  { id: 't-04', name: 'T-04', section: 'Main Dining', capacity: 4, status: 'occupied' },
  { id: 't-08', name: 'T-08', section: 'Main Dining', capacity: 6, status: 'billing' },
  { id: 't-12', name: 'T-12', section: 'AC Hall', capacity: 4, status: 'occupied' },
  { id: 'g-02', name: 'Garden-02', section: 'Garden', capacity: 4, status: 'available' },
  { id: 'r-05', name: 'Rooftop-05', section: 'Rooftop', capacity: 8, status: 'reserved' },
];
