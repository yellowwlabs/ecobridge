import materialCopperImg from '../assets/images/material_copper.jpg';
import materialIronSteelImg from '../assets/images/material_iron_steel.jpg';
import materialEwastePcbImg from '../assets/images/material_ewaste_pcb.jpg';
import materialLeadBatteryImg from '../assets/images/material_lead_battery.jpg';

export const MATERIALS_DATA = [
  {
    id: 'iron',
    name: { hi: 'लोहा', mr: 'लोखंड', en: 'Iron' },
    rate: 32,
    unit: 'kg',
    trend: 'up',
    trendValue: '+₹2',
    icon: 'Hammer',
    category: 'standard',
    photo: materialIronSteelImg,
    sparkline: [28, 29, 30, 30, 31, 32]
  },
  {
    id: 'copper',
    name: { hi: 'तांबा', mr: 'तांबे', en: 'Copper' },
    rate: 680,
    unit: 'kg',
    trend: 'up',
    trendValue: '+₹15',
    icon: 'Zap',
    category: 'standard',
    photo: materialCopperImg,
    sparkline: [650, 660, 660, 675, 680]
  },
  {
    id: 'newspaper',
    name: { hi: 'अखबार', mr: 'वर्तमानपत्रे', en: 'Newspaper' },
    rate: 18,
    unit: 'kg',
    trend: 'flat',
    trendValue: '₹0',
    icon: 'FileText',
    category: 'standard',
    photo: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
    sparkline: [18, 18, 18, 18, 18, 18]
  },
  {
    id: 'pet_bottles',
    name: { hi: 'प्लास्टिक बोतलें', mr: 'प्लास्टिक बाटल्या', en: 'PET Bottles' },
    rate: 26,
    unit: 'kg',
    trend: 'up',
    trendValue: '+₹1',
    icon: 'Wine',
    category: 'standard',
    photo: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    sparkline: [24, 24, 25, 25, 26]
  },
  {
    id: 'ewaste_circuit',
    name: { hi: 'ई-वेस्ट सर्किट बोर्ड', mr: 'ई-कचरा सर्किट बोर्ड', en: 'E-Waste PCB' },
    rate: 140,
    unit: 'kg',
    trend: 'up',
    trendValue: '+₹10',
    icon: 'Cpu',
    category: 'hidden_value',
    isHardToSell: true,
    photo: materialEwastePcbImg,
    sparkline: [120, 125, 130, 135, 140]
  },
  {
    id: 'lead_battery',
    name: { hi: 'गाड़ी बैटरी', mr: 'गाडी बॅटरी', en: 'Lead Battery' },
    rate: 95,
    unit: 'kg',
    trend: 'up',
    trendValue: '+₹5',
    icon: 'BatteryCharging',
    category: 'battery',
    requiresSafetyWarning: true,
    photo: materialLeadBatteryImg,
    sparkline: [88, 90, 92, 92, 95]
  },
  {
    id: 'small_battery',
    name: { hi: 'छोटी बैटरी', mr: 'लहान बॅटऱ्या', en: 'Small Battery' },
    rate: 45,
    unit: 'kg',
    trend: 'flat',
    trendValue: '₹0',
    icon: 'Battery',
    category: 'battery',
    requiresSafetyWarning: true,
    photo: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80',
    sparkline: [45, 45, 45, 45]
  },
  {
    id: 'mixed_plastic',
    name: { hi: 'कठोर प्लास्टिक', mr: 'कठीण प्लास्टिक', en: 'Hard Plastics' },
    rate: 19,
    unit: 'kg',
    trend: 'down',
    trendValue: '-₹1',
    icon: 'PackageSearch',
    category: 'hidden_value',
    isHardToSell: true,
    photo: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80',
    sparkline: [22, 21, 20, 20, 19]
  }
];
