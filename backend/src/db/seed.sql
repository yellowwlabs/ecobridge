-- Demo/reference data. Idempotent: every insert is ON CONFLICT DO NOTHING.

INSERT INTO users (id, mobile_number, name, operating_area, preferred_language, active_role, is_recycler_verified) VALUES
  ('usr_collector', '+919871234567', 'राजू कबाड़ीवाला', 'ओखला Phase 2, नई दिल्ली', 'hi', 'collector', FALSE),
  ('rec_01', '+919871200001', 'ग्रीन इंडिया रिसाइक्लिंग', 'ओखला Phase 2, नई दिल्ली', 'hi', 'recycler', TRUE),
  ('rec_02', '+919910400002', 'इकोवेव मेटल', 'मायापुरी, दिल्ली', 'hi', 'recycler', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO recyclers (
  user_id, business_name_en, business_name_hi, business_name_mr,
  rating, review_count, authorized, payment_methods_offered,
  bonus_note_en, bonus_note_hi, bonus_note_mr, pickup_available,
  address_en, address_hi, address_mr, phone_masked, avatar_url
) VALUES
  ('rec_01', 'Green India Recycling', 'ग्रीन इंडिया रिसाइक्लिंग', 'ग्रीन इंडिया रिसायकलिंग',
   4.9, 142, TRUE, '["UPI", "Cash"]'::jsonb,
   '+5% Bonus', '+5% बोनस', '+5% बोनस', TRUE,
   'Okhla Phase 2, New Delhi', 'ओखला Phase 2, नई दिल्ली', 'ओखला Phase 2, नवी दिल्ली',
   '+91 98712 *****', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'),
  ('rec_02', 'Ecowave Metals', 'इकोवेव मेटल', 'इकोवेव मेटल',
   4.7, 89, TRUE, '["UPI", "Cash"]'::jsonb,
   'Instant UPI Payment', 'तुरंत UPI भुगतान', 'त्वरित UPI पेमेंट', TRUE,
   'Mayapuri, Delhi', 'मायापुरी, दिल्ली', 'मायापुरी, दिल्ली',
   '+91 99104 *****', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO material_categories (id, name_en, name_hi, name_mr, rate_per_kg, icon, category, is_ewaste, is_hard_to_sell, requires_safety_warning, photo) VALUES
  ('iron', 'Iron / Steel', 'लोहा', 'लोखंड', 32, 'Hammer', 'standard', FALSE, FALSE, FALSE, 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=600&q=80'),
  ('copper', 'Copper', 'तांबा', 'तांबे', 680, 'Zap', 'standard', FALSE, FALSE, FALSE, 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=600&q=80'),
  ('newspaper', 'Newspaper', 'अखबार', 'वर्तमानपत्रे', 18, 'FileText', 'standard', FALSE, FALSE, FALSE, 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80'),
  ('pet_bottles', 'PET Bottles', 'प्लास्टिक बोतलें', 'प्लास्टिक बाटल्या', 26, 'Wine', 'standard', FALSE, FALSE, FALSE, 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80'),
  ('ewaste_circuit', 'E-Waste PCB', 'ई-वेस्ट सर्किट बोर्ड', 'ई-कचरा सर्किट बोर्ड', 140, 'Cpu', 'hidden_value', TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'),
  ('lead_battery', 'Lead Battery', 'गाड़ी बैटरी', 'गाडी बॅटरी', 95, 'BatteryCharging', 'battery', TRUE, FALSE, TRUE, 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80'),
  ('small_battery', 'Small Battery', 'छोटी बैटरी', 'लहान बॅटऱ्या', 45, 'Battery', 'battery', TRUE, FALSE, TRUE, 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80'),
  ('mixed_plastic', 'Hard Plastics', 'कठोर प्लास्टिक', 'कठीण प्लास्टिक', 19, 'PackageSearch', 'hidden_value', FALSE, TRUE, FALSE, 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- Opening rate history point per category (only when that category has none).
INSERT INTO rate_history (category_id, rate_per_kg, change_amount)
SELECT c.id, c.rate_per_kg, '+₹0'
FROM material_categories c
WHERE NOT EXISTS (SELECT 1 FROM rate_history h WHERE h.category_id = c.id);

INSERT INTO loyalty_ledger (id, user_id, points_delta, reason) VALUES
  ('ledger_init', 'usr_collector', 1250, 'Initial Signup Bonus & Lot Completed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO faq_entries (id, question_en, question_hi, question_mr, answer_en, answer_hi, answer_mr, category, sort_order) VALUES
  ('faq_1', 'What qualifies as E-Waste?', 'ई-वेस्ट (E-Waste) में क्या-क्या आता है?', 'ई-कचऱ्यामध्ये काय येते?',
   'Circuit boards (PCB), old phones, laptops, TVs, batteries, power cables, and electronics.',
   'सर्किट बोर्ड (PCB), पुराने मोबाइल, लैपटॉप, टीवी, यूपीएस बैटरी, पावर केबल, और घरेलू इलेक्ट्रॉनिक उपकरण।',
   'सर्किट बोर्ड, मोबाईल, लॅपटॉप, टीव्ही, बॅटरी, केबल्स आणि इलेक्ट्रॉनिक वस्तू.', 'ewaste', 1),
  ('faq_2', 'What safety precautions to follow for batteries?', 'बैटरी निपटाते समय क्या सावधानियां रखें?', 'बॅटरी विल्हेवाट लावताना काय काळजी घ्यावी?',
   'Never invert batteries. Wear gloves for leaks and hand over to authorized recyclers only.',
   'बैटरी को कभी उल्टा न करें। रिसाव से बचने के लिए दस्ताने पहनें और केवल अधिकृत रिसाइक्लर को ही सौंपें।',
   'बॅटरी उलटी करू नका. हातमोजे वापरा व अधिकृत रिसायकलरकडे द्या.', 'safety', 2),
  ('faq_3', 'How is E-Waste valuation determined?', 'ई-वेस्ट का सही भाव कैसे तय होता है?', 'ई-कचऱ्याचा दर कसा ठरतो?',
   'Valuation is based on precious metals (copper, silver) and circuit board grading.',
   'ई-वेस्ट का भाव उसमें मौजूद कीमती धातुओं (जैसे तांबा, चांदी) और सर्किट बोर्ड की श्रेणी के आधार पर तय होता है।',
   'त्यातील मौल्यवान धातू आणि सर्किट बोर्डच्या श्रेणीनुसार दर ठरतो.', 'general', 3),
  ('faq_4', 'Is there any fee for doorstep pickup?', 'क्या डोरस्टेप पिकअप के लिए अतिरिक्त शुल्क लगता है?', 'डोरस्टेप पिकअपसाठी अतिरिक्त शुल्क आहे का?',
   'No! Our authorized partners provide doorstep pickup free of extra charge.',
   'नहीं! हमारे अधिकृत पार्टनर पिकअप का कोई अतिरिक्त चार्ज नहीं लेते।',
   'नाही! पिकअप पूर्णपणे मोफत आहे.', 'general', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO community_posts (
  id, author_en, author_hi, author_mr, avatar,
  location_en, location_hi, location_mr,
  time_ago_en, time_ago_hi, time_ago_mr,
  audio_duration, audio_text_en, audio_text_hi, audio_text_mr,
  likes, comments_count
) VALUES (
  'post_1', 'Ramesh Kumar (Collector - Okhla)', 'रामेश कुमार (कबाड़ीवाला - ओखला)', 'रमेश कुमार (कबाडीवाला - ओखला)',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  'Okhla Phase 3', 'ओखला Phase 3', 'ओखला Phase 3',
  '20 mins ago', '20 मिनट पहले', '20 मिनिटांपूर्वी',
  '0:18', 'Brothers, copper rates are up today! Got ₹680/kg at Okhla yard.',
  'भाईयों, आज तांबे का भाव बहुत तेज है! ओखला यार्ड में 680 रुपये मिला।',
  'भावांनो, आज तांब्याचा भाव वाढला आहे! 680 रुपये दर मिळाला.',
  18, 4
) ON CONFLICT (id) DO NOTHING;

-- Demo lot in flight (Accepted) and a completed lot with its certificate.
INSERT INTO lots (
  id, lot_number, collector_id, material_category_id, weight_kg, estimated_rate, total_price,
  ai_detected_label, ai_confidence, photo, status, status_step, location_geo, location_address_text
) VALUES
  ('LOT-8921', 'LOT-8921', 'usr_collector', 'copper', 12.5, 680, 8500,
   'Copper Cable', 0.94, 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=400&q=80',
   'Accepted', 3, 'Okhla Phase 2, New Delhi', 'Okhla Phase 2, New Delhi · 0.8 km away'),
  ('LOT-8610', 'LOT-8610', 'usr_collector', 'lead_battery', 24, 95, 2280,
   'Lead-Acid Battery', 0.98, 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=400&q=80',
   'Completed', 5, 'Okhla Industrial Area, New Delhi', 'Okhla Industrial Area, New Delhi · 1.2 km away')
ON CONFLICT (id) DO NOTHING;

INSERT INTO offers (id, lot_id, recycler_id, rate_per_kg_offered, total_amount, status, rate_anomaly_flag) VALUES
  ('off_8921_1', 'LOT-8921', 'rec_01', 680, 8500, 'selected', FALSE),
  ('off_8610_1', 'LOT-8610', 'rec_01', 95, 2280, 'selected', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO transactions (id, lot_id, offer_id, status, status_step, payment_method, payment_reference, handover_confirmed_at, payment_confirmed_at) VALUES
  ('tx_8921', 'LOT-8921', 'off_8921_1', 'Accepted', 3, 'UPI', '', NULL, NULL),
  ('tx_8610', 'LOT-8610', 'off_8610_1', 'Completed', 5, 'UPI', 'UPI-9812401', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO certificates (
  id, transaction_id, lot_number, gps_stamp, time_stamp, recycler_name_at_time, payment_method_at_time, amount, weight_kg, material_category
) VALUES (
  'cert_8610', 'tx_8610', 'LOT-8610', 'Okhla Industrial Area, New Delhi', NOW(), 'Green India Recycling Hub', 'UPI', 2280, 24, 'Lead-Acid Battery'
) ON CONFLICT (id) DO NOTHING;
