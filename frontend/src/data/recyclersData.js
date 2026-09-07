export const RECYCLERS_DATA = [
  {
    id: 'rec_01',
    name: { hi: 'ग्रीन इंडिया रिसाइक्लिंग', mr: 'ग्रीन इंडिया रिसायकलिंग', en: 'Green India Recycling' },
    avatar: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80',
    facilityPhoto: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80',
    authorization_status: 'authorized', // green shield badge
    rating: 4.9,
    reviewsCount: 142,
    distance: '0.8 km',
    address: { hi: 'ओखला Phase 2, नई दिल्ली', mr: 'ओखला Phase 2, नवी दिल्ली', en: 'Okhla Phase 2, New Delhi' },
    phoneMasked: '+91 98XXX X1234',
    pickupAvailable: true,
    minWeightPickupKg: 50,
    materialsAccepted: ['iron', 'copper', 'pet_bottles', 'ewaste_circuit', 'lead_battery'],
    ratesBonus: { hi: '+5% बोनस', mr: '+5% बोनस', en: '+5% Bonus' }
  },
  {
    id: 'rec_02',
    name: { hi: 'इकोवेव मेटल', mr: 'इकोवेव मेटल', en: 'Ecowave Metals' },
    avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    facilityPhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    authorization_status: 'authorized',
    rating: 4.7,
    reviewsCount: 89,
    distance: '1.4 km',
    address: { hi: 'मायापुरी, दिल्ली', mr: 'मायापुरी, दिल्ली', en: 'Mayapuri, Delhi' },
    phoneMasked: '+91 99XXX X4321',
    pickupAvailable: true,
    minWeightPickupKg: 30,
    materialsAccepted: ['iron', 'copper', 'lead_battery', 'small_battery'],
    ratesBonus: { hi: 'तुरंत UPI भुगतान', mr: 'त्वरित UPI पेमेंट', en: 'Instant UPI Payment' }
  },
  {
    id: 'rec_03',
    name: { hi: 'विशेष प्लास्टिक रिसाइक्लर', mr: 'विशेष प्लास्टिक रिसायकलर', en: 'Specialty Plastic Recyclers' },
    avatar: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80',
    facilityPhoto: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80',
    authorization_status: 'authorized',
    rating: 4.8,
    reviewsCount: 64,
    distance: '2.1 km',
    address: { hi: 'पटपड़गंज इंडस्ट्रियल एरिया', mr: 'पटपडगंज इंडस्ट्रियल एरिया', en: 'Patparganj Industrial Area' },
    phoneMasked: '+91 98XXX X8991',
    pickupAvailable: true,
    minWeightPickupKg: 40,
    materialsAccepted: ['pet_bottles', 'mixed_plastic', 'ewaste_circuit'],
    ratesBonus: { hi: 'कठोर प्लास्टिक विशेष दर', mr: 'कठीण प्लास्टिक विशेष दर', en: 'Hard Plastics Special Rate' }
  },
  {
    id: 'rec_04',
    name: { hi: 'शर्मा स्क्रैप ट्रेडर्स', mr: 'शर्मा स्क्रॅप ट्रेडर्स', en: 'Sharma Scrap Traders' },
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    facilityPhoto: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    authorization_status: 'unverified', // grey outline badge
    rating: 4.1,
    reviewsCount: 23,
    distance: '0.4 km',
    address: { hi: 'गांधी नगर मार्केट', mr: 'गांधी नगर मार्केट', en: 'Gandhi Nagar Market' },
    phoneMasked: '+91 98XXX X8110',
    pickupAvailable: false,
    minWeightPickupKg: 0,
    materialsAccepted: ['iron', 'newspaper', 'pet_bottles'],
    ratesBonus: { hi: 'नकद भुगतान', mr: 'रोख पेमेंट', en: 'Cash Payment' }
  }
];
