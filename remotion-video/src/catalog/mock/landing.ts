// Mock data for Landing page UI clones

export interface MockHeroVisualData {
  tableCode: string;
  tableName: string;
  guestCount: number;
  runningBill: number;
  mainKitchenItems: Array<{ qty: number; name: string; status: 'preparing' | 'ready' | 'served' }>;
  beverageItems: Array<{ qty: number; name: string; status: 'prep' | 'ready' | 'served' }>;
  avgTurnaroundMins: number;
}

export const MOCK_HERO_VISUAL: Record<'en' | 'hi' | 'mr', MockHeroVisualData> = {
  en: {
    tableCode: 'T-04',
    tableName: 'Table 4 — AC Dining Hall',
    guestCount: 3,
    runningBill: 1420,
    mainKitchenItems: [
      { qty: 1, name: 'Paneer Tikka Masala', status: 'preparing' },
      { qty: 2, name: 'Butter Garlic Naan', status: 'ready' },
    ],
    beverageItems: [
      { qty: 2, name: 'Fresh Lime Soda', status: 'served' },
      { qty: 1, name: 'Cold Brew Tonic', status: 'prep' },
    ],
    avgTurnaroundMins: 8.4,
  },
  hi: {
    tableCode: 'T-04',
    tableName: 'टेबल 4 — एसी डाइनिंग हॉल',
    guestCount: 3,
    runningBill: 1420,
    mainKitchenItems: [
      { qty: 1, name: 'पनीर टिक्का मसाला', status: 'preparing' },
      { qty: 2, name: 'बटर गार्लिक नान', status: 'ready' },
    ],
    beverageItems: [
      { qty: 2, name: 'ताजा नींबू सोडा', status: 'served' },
      { qty: 1, name: 'कोल्ड ब्रू टॉनिक', status: 'prep' },
    ],
    avgTurnaroundMins: 8.4,
  },
  mr: {
    tableCode: 'T-04',
    tableName: 'टेबल 4 — एसी डायनिंग हॉल',
    guestCount: 3,
    runningBill: 1420,
    mainKitchenItems: [
      { qty: 1, name: 'पनीर टिक्का मसाला', status: 'preparing' },
      { qty: 2, name: 'बटर गार्लिक नान', status: 'ready' },
    ],
    beverageItems: [
      { qty: 2, name: 'फ्रेश लेमन सोडा', status: 'served' },
      { qty: 1, name: 'कोल्ड ब्रू टॉनिक', status: 'prep' },
    ],
    avgTurnaroundMins: 8.4,
  },
};

export interface MockLandingFeature {
  id: string;
  badge: string;
  title: string;
  description: string;
}

export const MOCK_LANDING_FEATURES: Record<'en' | 'hi' | 'mr', MockLandingFeature[]> = {
  en: [
    {
      id: 'qr',
      badge: 'Guest Experience',
      title: 'Seamless QR Table Sessions',
      description: 'Guests scan table QR codes to instantly join a shared live dining session without installing apps or signing up.',
    },
    {
      id: 'kds',
      badge: 'Kitchen Operations',
      title: 'Station-Level Kitchen Routing (KDS)',
      description: 'Items automatically route to designated prep stations with instant ticket alerts on kitchen displays.',
    },
    {
      id: 'branch',
      badge: 'Multi-Location',
      title: 'Enterprise Multi-Branch Control',
      description: 'Manage all physical branches under one umbrella with isolated shifts, menus, and staff hierarchies.',
    },
    {
      id: 'staff',
      badge: 'Workforce',
      title: 'Granular Staff & Shift Hierarchy',
      description: 'Assign waiters, section managers, kitchen staff, and cashiers to dedicated dining zones and shifts.',
    },
    {
      id: 'tax',
      badge: 'Compliance Ready',
      title: 'Intelligent GST Tax & Compliance Engine',
      description: 'Fully configurable Indian tax engine supporting CGST, SGST, IGST, cess, and inclusive/exclusive calculation modes.',
    },
    {
      id: 'security',
      badge: 'Bank-Grade Security',
      title: 'Immutable Security & Audit Trail',
      description: 'Enterprise security architecture featuring bcrypt encryption, SHA-256 verification, and complete audit logging.',
    },
  ],
  hi: [
    {
      id: 'qr',
      badge: 'अतिथि अनुभव',
      title: 'सहज क्यूआर टेबल सत्र',
      description: 'मेहमान बिना किसी ऐप के टेबल क्यूआर कोड स्कैन करके सीधे लाइव डाइनिंग सत्र में शामिल होते हैं।',
    },
    {
      id: 'kds',
      badge: 'रसोई संचालन',
      title: 'स्टेशन-स्तरीय रसोई रूटिंग (केडीएस)',
      description: 'ऑर्डर स्वचालित रूप से संबंधित तैयारी स्टेशनों पर सीधे डिजिटल टिकट अलर्ट के साथ पहुंचते हैं।',
    },
    {
      id: 'branch',
      badge: 'मल्टी-ब्रांच नियंत्रण',
      title: 'एंटरप्राइज मल्टी-लोकेशन प्रबंधन',
      description: 'प्रत्येक शाखा के स्वतंत्र शिफ्ट, मेनू और स्टाफ पदानुक्रम के साथ कई आउटलेट्स को एक साथ नियंत्रित करें।',
    },
    {
      id: 'staff',
      badge: 'कार्यबल प्रबंधन',
      title: 'सटीक स्टाफ और शिफ्ट संरचना',
      description: 'वेटर, किचन स्टाफ और कैशियर को समर्पित डाइनिंग क्षेत्रों और शिफ्ट में सुगमता से असाइन करें।',
    },
    {
      id: 'tax',
      badge: 'अनुपालन तैयार',
      title: 'स्मार्ट जीएसटी कर और अनुपालन प्रणाली',
      description: 'सीजीएसटी, एसजीएसटी, आईजीएसटी और सर्विस चार्ज को स्वचालित रूप से सटीक गणना करने वाला टैक्स इंजन।',
    },
    {
      id: 'security',
      badge: 'सुरक्षित और विश्वसनीय',
      title: 'अपरिवर्तनीय सुरक्षा और ऑडिट ट्रेल',
      description: 'उन्नत एन्क्रिप्शन और सुरक्षित सत्र प्रबंधन के साथ उच्च स्तरीय सुरक्षा प्रणाली।',
    },
  ],
  mr: [
    {
      id: 'qr',
      badge: 'ग्राहक अनुभव',
      title: 'सुलभ क्यूआर टेबल सत्र',
      description: 'ग्राहक कोणत्याही अॅपशिवाय टेबलवरील क्यूआर कोड स्कॅन करून थेट लाईव्ह ऑर्डरिंगमध्ये सहभागी होतात.',
    },
    {
      id: 'kds',
      badge: 'किचन कार्यपद्धती',
      title: 'स्टेशननुसार किचन रूटिंग (केडीएस)',
      description: 'ऑर्डर्स आपोआप संबंधित किचन स्टेशन्सवर रिअल-टाइम अलर्टसह अचूक पाठवल्या जातात.',
    },
    {
      id: 'branch',
      badge: 'अनेक शाखा व्यवस्थापन',
      title: 'मध्यवर्ती मल्टी-ब्रँच नियंत्रण',
      description: 'प्रत्येक शाखेसाठी स्वतंत्र शिफ्ट, मेनू आणि कर्मचारी व्यवस्थेसह सर्व आउटलेट्सचे नियंत्रण एकाच ठिकाणी.',
    },
    {
      id: 'staff',
      badge: 'कर्मचारी व्यवस्थापन',
      title: 'कर्मचारी आणि कामाच्या पाळ्यांचे व्यवस्थापन',
      description: 'वेटर, शेफ आणि बिलिंग स्टाफला त्यांच्या विशिष्ट विभागांमध्ये आणि पाळ्यांमध्ये सहज नियुक्त करा.',
    },
    {
      id: 'tax',
      badge: 'जीएसटी सुसंगत',
      title: 'अचूक जीएसटी कर आणि कायदेशीर प्रणाली',
      description: 'सीजीएसटी, एसजीएसटी आणि सेवा शुल्काची स्वयंचलित आणि कायदेशीर गणना करणारी प्रणाली.',
    },
    {
      id: 'security',
      badge: 'बँक-दर्जा सुरक्षा',
      title: 'अभंग सुरक्षा आणि ऑडिट नोंदी',
      description: 'आधुनिक एन्क्रिप्शन आणि संपूर्ण व्यवहारांच्या सुरक्षित नोंदीसह उच्च दर्जाची सुरक्षा रचना.',
    },
  ],
};
