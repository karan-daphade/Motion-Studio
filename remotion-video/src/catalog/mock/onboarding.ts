// Mock data for Onboarding UI clones authentic to Indian F&B businesses

export interface OnboardingStepMock {
  step: number;
  name: string;
  shortDesc: string;
}

export const MOCK_ONBOARDING_STEPS: Record<'en' | 'hi' | 'mr', OnboardingStepMock[]> = {
  en: [
    { step: 1, name: 'Branch Setup', shortDesc: 'Profile, GPS & GSTIN' },
    { step: 2, name: 'Kitchen Management', shortDesc: 'Stations & Printers' },
    { step: 3, name: 'Shift Management', shortDesc: 'Hours & Schedules' },
    { step: 4, name: 'Sections & Tables', shortDesc: 'Floor layout & QR' },
    { step: 5, name: 'Employees', shortDesc: 'Staff roles & access' },
    { step: 6, name: 'Menu Engineering', shortDesc: 'Items & dynamic pricing' },
    { step: 7, name: 'Tax & Compliance', shortDesc: 'GST engine & rules' },
  ],
  hi: [
    { step: 1, name: 'शाखा सेटअप', shortDesc: 'प्रोफ़ाइल, जीपीएस और जीएसटी' },
    { step: 2, name: 'रसोई प्रबंधन', shortDesc: 'स्टेशन और प्रिंटर' },
    { step: 3, name: 'शिफ्ट प्रबंधन', shortDesc: 'काम के घंटे और समय' },
    { step: 4, name: 'सेक्शन और टेबल', shortDesc: 'फ्लोर लेआउट और क्यूआर' },
    { step: 5, name: 'कर्मचारी', shortDesc: 'स्टाफ भूमिकाएं और अनुमतियां' },
    { step: 6, name: 'मेनू प्रबंधन', shortDesc: 'व्यंजन और मूल्य निर्धारण' },
    { step: 7, name: 'कर और अनुपालन', shortDesc: 'जीएसटी नियम और गणना' },
  ],
  mr: [
    { step: 1, name: 'शाखा सेटअप', shortDesc: 'प्रोफाइल, जीपीएस आणि जीएसटी' },
    { step: 2, name: 'स्वयंपाकघर व्यवस्थापन', shortDesc: 'स्टेशन्स आणि प्रिंटर' },
    { step: 3, name: 'पाळी व्यवस्थापन', shortDesc: 'कामाचे तास आणि वेळापत्रक' },
    { step: 4, name: 'विभाग आणि टेबल्स', shortDesc: 'फ्लोर लेआउट आणि क्यूआर' },
    { step: 5, name: 'कर्मचारी', shortDesc: 'कर्मचारी भूमिका आणि प्रवेश' },
    { step: 6, name: 'मेनू अभियांत्रिकी', shortDesc: 'पदार्थ आणि गतिमान दर' },
    { step: 7, name: 'कर आणि कायदेशीर बाबी', shortDesc: 'जीएसटी प्रणाली आणि नियम' },
  ],
};

export interface MockBranchData {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  managerName: string;
  managerPhone: string;
  gstin?: string;
  googleReviewLink?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

export const MOCK_BRANCH_SETUP: Record<'en' | 'hi' | 'mr', MockBranchData> = {
  en: {
    name: 'Spice Garden — Indiranagar Outlet',
    phone: '9876543210',
    address: 'Plot 42, 100 Feet Road, HAL 2nd Stage',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560038',
    latitude: 12.9716,
    longitude: 77.5946,
    googleMapsUrl: 'https://maps.google.com/?q=Spice+Garden+Indiranagar',
    managerName: 'Rajesh Sharma',
    managerPhone: '9823456789',
    gstin: '29AAAAA0000A1Z5',
    googleReviewLink: 'https://g.page/r/spice-garden/review',
    facebookUrl: 'https://facebook.com/spicegardenblr',
    instagramUrl: 'https://instagram.com/spicegardenblr',
    youtubeUrl: 'https://youtube.com/@spicegardenblr',
  },
  hi: {
    name: 'स्पाइस गार्डन — इंदिरानगर शाखा',
    phone: '9876543210',
    address: 'प्लॉट 42, 100 फीट रोड, एचएएल दूसरा चरण',
    city: 'बेंगलुरु',
    state: 'कर्नाटक',
    pinCode: '560038',
    latitude: 12.9716,
    longitude: 77.5946,
    googleMapsUrl: 'https://maps.google.com/?q=Spice+Garden+Indiranagar',
    managerName: 'राजेश शर्मा',
    managerPhone: '9823456789',
    gstin: '29AAAAA0000A1Z5',
    googleReviewLink: 'https://g.page/r/spice-garden/review',
    facebookUrl: 'https://facebook.com/spicegardenblr',
    instagramUrl: 'https://instagram.com/spicegardenblr',
    youtubeUrl: 'https://youtube.com/@spicegardenblr',
  },
  mr: {
    name: 'स्पाइस गार्डन — इंदिरानगर शाखा',
    phone: '9876543210',
    address: 'प्लॉट 42, 100 फीट रोड, एचएएल दुसरा टप्पा',
    city: 'बेंगळुरू',
    state: 'कर्नाटक',
    pinCode: '560038',
    latitude: 12.9716,
    longitude: 77.5946,
    googleMapsUrl: 'https://maps.google.com/?q=Spice+Garden+Indiranagar',
    managerName: 'राजेश शर्मा',
    managerPhone: '9823456789',
    gstin: '29AAAAA0000A1Z5',
    googleReviewLink: 'https://g.page/r/spice-garden/review',
    facebookUrl: 'https://facebook.com/spicegardenblr',
    instagramUrl: 'https://instagram.com/spicegardenblr',
    youtubeUrl: 'https://youtube.com/@spicegardenblr',
  },
};
