import materialCopperImg from '../assets/images/material_copper.jpg';
import materialIronSteelImg from '../assets/images/material_iron_steel.jpg';
import materialLeadBatteryImg from '../assets/images/material_lead_battery.jpg';

export const INITIAL_TRANSACTIONS = [
  {
    id: 'LOT-8921',
    materialId: 'copper',
    materialName: { hi: 'तांबा', mr: 'तांबे', en: 'Copper Cable' },
    photo: materialCopperImg,
    weightKg: 12.5,
    estimatedRate: 680,
    totalPrice: 8500,
    status: 'Accepted', // 'Posted' | 'Quoted' | 'Accepted' | 'Handover' | 'Paid'
    statusStep: 3, // 1=Posted, 2=Quoted, 3=Accepted, 4=Handover, 5=Paid
    recycler: {
      id: 'rec_01',
      name: { hi: 'ग्रीन इंडिया रिसाइक्लिंग Hub', mr: 'ग्रीन इंडिया रिसायकलिंग Hub', en: 'Green India Recycling Hub' },
      authorization: 'authorized',
      phone: '+91 98XXX X1234'
    },
    pickupDate: { hi: 'आज दोपहर 2:30 बजे', mr: 'आज दुपारी 2:30 वाजता', en: 'Today at 2:30 PM' },
    paymentMethod: 'UPI',
    isAnomaly: false,
    timestamp: '2026-09-06 10:15 AM',
    gps: 'Okhla Phase 2, New Delhi · 0.8 km away'
  },
  {
    id: 'LOT-8742',
    materialId: 'iron',
    materialName: { hi: 'लोहा', mr: 'लोखंड', en: 'Iron / Steel' },
    photo: materialIronSteelImg,
    weightKg: 85,
    estimatedRate: 32,
    totalPrice: 2720,
    status: 'Paid',
    statusStep: 5,
    recycler: {
      id: 'rec_02',
      name: { hi: 'इकोवेव मेटल प्रोसेसिंग', mr: 'इकोवेव मेटल प्रोसेसिंग', en: 'Ecowave Metal Processing' },
      authorization: 'authorized',
      phone: '+91 99XXX X4321'
    },
    paymentMethod: 'Cash',
    isAnomaly: false,
    timestamp: '2026-09-05 04:20 PM',
    gps: 'Mayapuri Industrial Area, Delhi · 2.5 km away'
  },
  {
    id: 'LOT-8610',
    materialId: 'lead_battery',
    materialName: { hi: 'गाड़ी बैटरी', mr: 'गाडी बॅटरी', en: 'Lead-Acid Battery' },
    photo: materialLeadBatteryImg,
    weightKg: 24,
    estimatedRate: 95,
    totalPrice: 2280,
    status: 'Paid',
    statusStep: 5,
    recycler: {
      id: 'rec_01',
      name: { hi: 'ग्रीन इंडिया रिसाइक्लिंग Hub', mr: 'ग्रीन इंडिया रिसायकलिंग Hub', en: 'Green India Recycling Hub' },
      authorization: 'authorized',
      phone: '+91 98XXX X1234'
    },
    paymentMethod: 'UPI',
    isAnomaly: false,
    timestamp: '2026-09-03 11:00 AM',
    gps: 'Okhla Industrial Area, New Delhi · 1.2 km away'
  }
];

export const INITIAL_LOYALTY = {
  points: 1250,
  rupeesEquivalent: 125,
  conversionHistory: [
    { id: 'CNV-102', points: 500, amountRupees: 50, date: '01 Sep 2026', upiId: 'raju@upi' }
  ]
};

export const INITIAL_COMMUNITY_POSTS = [
  {
    id: 'post_1',
    author: { hi: 'रामेश कुमार (कबाड़ीवाला - ओखला)', mr: 'रमेश कुमार (कबाडीवाला - ओखला)', en: 'Ramesh Kumar (Collector - Okhla)' },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    location: { hi: 'ओखला Phase 3', mr: 'ओखला Phase 3', en: 'Okhla Phase 3' },
    timeAgo: { hi: '20 मिनट पहले', mr: '20 मिनिटांपूर्वी', en: '20 mins ago' },
    audioDuration: '0:18',
    audioText: {
      hi: 'भाईयों, आज तांबे का भाव बहुत तेज है! ओखला यार्ड में 680 रुपये मिला।',
      mr: 'भावांनो, आज तांब्याचा भाव वाढला आहे! 680 रुपये दर मिळाला.',
      en: 'Brothers, copper rates are up today! Got ₹680/kg at Okhla yard.'
    },
    likes: 18,
    commentsCount: 4
  },
  {
    id: 'post_2',
    author: { hi: 'सुरेश यादव (कबाड़ीवाला - मायापुरी)', mr: 'सुरेश यादव (कबाडीवाला - मायापुरी)', en: 'Suresh Yadav (Collector - Mayapuri)' },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    location: { hi: 'मायापुरी', mr: 'मायापुरी', en: 'Mayapuri' },
    timeAgo: { hi: '1 घंटा पहले', mr: '1 तासापूर्वी', en: '1 hour ago' },
    audioDuration: '0:25',
    audioText: {
      hi: 'पुरानी इन्वर्टर बैटरी के लिए ग्रीन इंडिया hub पर अच्छा रेट और नकद भुगतान मिल रहा है।',
      mr: 'इन्व्हर्टर बॅटरीसाठी चांगला भाव मिळतोय.',
      en: 'Green India Hub is offering great rates and cash payment for inverter batteries.'
    },
    likes: 24,
    commentsCount: 7
  }
];
