export const SAFETY_DATA = [
  {
    id: 'battery_acid',
    title: { hi: 'बैटरी एसिड से बचाव', mr: 'बॅटरी ऍसिड सुरक्षा', en: 'Battery Acid Handling' },
    icon: 'ShieldAlert',
    severity: 'danger',
    audio: {
      hi: 'ध्यान दें! बैटरी खोलते समय दस्ताने और चश्मा पहनें। एसिड स्किन और कपड़ों को जला सकता है!',
      mr: 'लक्ष द्या! बॅटरी उघडताना हातमोजे आणि चष्मा वापरा. ऍसिडपासून बचाव करा!',
      en: 'Warning! Wear gloves and goggles when handling batteries. Acid can cause severe burns!'
    },
    image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=400&q=80',
    description: {
      hi: '1. कभी भी बैटरी को उलटा न करें।\n2. रिसाव होने पर पानी से धोएं।\n3. अधिकृत रिसाइक्लर को ही सौंपें।',
      mr: '1. बॅटरी उलटी करू नका.\n2. गळती झाल्यास पाण्याने धुवा.',
      en: '1. Never tilt or flip battery.\n2. Flush leaks with plenty of water.\n3. Hand over only to authorized dealers.'
    }
  },
  {
    id: 'no_burning',
    title: { hi: 'प्लास्टिक / तार न जलाएं', mr: 'प्लास्टिक / वायर जाळू नका', en: 'Do Not Burn Wire/Plastic' },
    icon: 'Flame',
    severity: 'danger',
    audio: {
      hi: 'तार का तांबा निकालने के लिए आग न लगाएं। जहरीला धुआं फेफड़ों के लिए खतरनाक है और कानूनन अपराध है!',
      mr: 'तांबे काढण्यासाठी वायर जाळू नका. विषारी धूर आरोग्यासाठी घातक आहे!',
      en: 'Never burn plastic insulation to strip copper wire. Toxic fumes cause severe respiratory illness and is illegal!'
    },
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    description: {
      hi: 'तार छीलने के लिए स्ट्रिपर टूल का प्रयोग करें या तांबा-तार उसी हाल में बेचें।',
      mr: 'वायर सोलण्यासाठी स्ट्रिपर वापरा.',
      en: 'Use a wire stripper or sell unstripped wire to authorized recyclers.'
    }
  },
  {
    id: 'heavy_lifting',
    title: { hi: 'भारी स्क्रैप उठाने का सही तरीका', mr: 'जड साहित्य उचलण्याची पद्धत', en: 'Safe Heavy Lifting' },
    icon: 'Activity',
    severity: 'warning',
    audio: {
      hi: 'भारी लोहा उठाते समय घुटने मोड़ें, पीठ सीधी रखें। चोट से बचें।',
      mr: 'जड वस्तू उचलताना पाठीचा कणा सरळ ठेवा.',
      en: 'Bend knees and keep back straight when lifting heavy scrap bundles.'
    },
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    description: {
      hi: 'हमेशा घुटने मोड़कर सामान उठाएं, कमर पर दबाव न डालें।',
      mr: 'कमरेवर ताण न देता पायांचा वापर करा.',
      en: 'Lift with your legs, not your lower back.'
    }
  }
];
