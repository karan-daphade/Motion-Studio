/**
 * Authentic Indian restaurant menu mocks with INR pricing.
 * CAT-07 compliance: INR currency, authentic dish names.
 */

export interface MockMenuItem {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  category: 'Starters' | 'Mains' | 'Breads' | 'Beverages' | 'Desserts';
  price: number; // in INR
  isVeg: boolean;
  isPopular?: boolean;
}

export const MOCK_MENU_ITEMS: MockMenuItem[] = [
  {
    id: 'm-01',
    name: 'Paneer Butter Masala',
    nameHi: 'पनीर बटर मसाला',
    nameMr: 'पनीर बटर मसाला',
    category: 'Mains',
    price: 280,
    isVeg: true,
    isPopular: true,
  },
  {
    id: 'm-02',
    name: 'Dal Makhani',
    nameHi: 'दाल मखनी',
    nameMr: 'दाल मखनी',
    category: 'Mains',
    price: 240,
    isVeg: true,
    isPopular: true,
  },
  {
    id: 'm-03',
    name: 'Butter Naan',
    nameHi: 'बटर नान',
    nameMr: 'बटर नान',
    category: 'Breads',
    price: 50,
    isVeg: true,
  },
  {
    id: 'm-04',
    name: 'Masala Dosa',
    nameHi: 'मसाला डोसा',
    nameMr: 'मसाला डोसा',
    category: 'Starters',
    price: 120,
    isVeg: true,
    isPopular: true,
  },
  {
    id: 'm-05',
    name: 'Special Veg Dum Biryani',
    nameHi: 'वेज दम बिरयानी',
    nameMr: 'व्हेज दम बिर्याणी',
    category: 'Mains',
    price: 320,
    isVeg: true,
  },
  {
    id: 'm-06',
    name: 'South Indian Filter Coffee',
    nameHi: 'फ़िल्टर कॉफ़ी',
    nameMr: 'फिल्टर कॉफी',
    category: 'Beverages',
    price: 60,
    isVeg: true,
  },
  {
    id: 'm-07',
    name: 'Gulab Jamun (2 pcs)',
    nameHi: 'गुलाब जामुन',
    nameMr: 'गुलाब जाम',
    category: 'Desserts',
    price: 90,
    isVeg: true,
  },
];
