export type Lang = 'en' | 'hi' | 'mr';

export interface AuthUser {
  id: string;
  mobile_number: string;
  name: string;
  preferred_language: string;
  active_role: string;
  operating_area?: string;
}

export interface User {
  id: string;
  mobile_number: string;
  name: string;
  operating_area: string;
  preferred_language: string;
  active_role: string;
  is_recycler_verified: boolean;
  created_at: Date;
}

export interface Recycler {
  user_id: string;
  business_name_en: string;
  business_name_hi: string;
  business_name_mr: string;
  rating: number;
  review_count: number;
  authorized: boolean;
  payment_methods_offered: string[];
  bonus_note_en: string;
  bonus_note_hi: string;
  bonus_note_mr: string;
  pickup_available: boolean;
  address_en: string;
  address_hi: string;
  address_mr: string;
  phone_masked: string;
  avatar_url: string;
}

export interface MaterialCategory {
  id: string;
  name_en: string;
  name_hi: string;
  name_mr: string;
  rate_per_kg: number;
  unit: string;
  trend: string;
  trend_value: string;
  icon: string;
  category: string;
  is_ewaste: boolean;
  is_hard_to_sell: boolean;
  requires_safety_warning: boolean;
  photo: string;
}

export interface RateHistoryEntry {
  id: number;
  category_id: string;
  rate_per_kg: number;
  change_amount: string;
  updated_at: Date;
}

export interface Lot {
  id: string;
  lot_number: string;
  collector_id: string;
  material_category_id: string;
  weight_kg: number;
  estimated_rate: number;
  total_price: number;
  ai_detected_label: string | null;
  ai_confidence: number | null;
  photo: string;
  status: string;
  status_step: number;
  location_geo: string;
  location_address_text: string;
  created_at: Date;
}

export interface Offer {
  id: string;
  lot_id: string;
  recycler_id: string;
  rate_per_kg_offered: number;
  total_amount: number;
  status: string;
  rate_anomaly_flag: boolean;
  created_at: Date;
}

export interface Transaction {
  id: string;
  lot_id: string;
  offer_id: string | null;
  status: string;
  status_step: number;
  payment_method: string;
  payment_reference: string;
  handover_confirmed_at: Date | null;
  payment_confirmed_at: Date | null;
  created_at: Date;
}

export interface Certificate {
  id: string;
  transaction_id: string;
  lot_number: string;
  gps_stamp: string;
  time_stamp: Date;
  recycler_name_at_time: string;
  payment_method_at_time: string;
  amount: number;
  weight_kg: number;
  material_category: string;
}

export interface LoyaltyLedgerEntry {
  id: string;
  user_id: string;
  points_delta: number;
  reason: string;
  upi_id: string;
  amount_rupees: number;
  created_at: Date;
}

export interface EwastePickup {
  id: string;
  collector_id: string;
  material_category_id: string;
  scheduled_date: string;
  location_text: string;
  status: string;
  linked_lot_id: string | null;
  created_at: Date;
}

export interface AiCallSession {
  id: string;
  initiated_by_user_id: string;
  lot_id: string | null;
  recycler_id: string | null;
  status: string;
  transcript: string;
  outcome_summary: string;
  started_at: Date;
  ended_at: Date | null;
}

export interface ProxyCallSession {
  id: string;
  lot_id: string | null;
  caller_id: string;
  receiver_id: string;
  virtual_proxy_number: string;
  provider: string;
  status: string;
  expires_at: Date;
  created_at: Date;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  type: string;
  title_en: string;
  title_hi: string;
  title_mr: string;
  body_en: string;
  body_hi: string;
  body_mr: string;
  sent_at: Date;
  read_at: Date | null;
}

export interface FaqEntry {
  id: string;
  question_en: string;
  question_hi: string;
  question_mr: string;
  answer_en: string;
  answer_hi: string;
  answer_mr: string;
  category: string;
  sort_order: number;
}

export interface CommunityPost {
  id: string;
  author_en: string;
  author_hi: string;
  author_mr: string;
  avatar: string;
  location_en: string;
  location_hi: string;
  location_mr: string;
  time_ago_en: string;
  time_ago_hi: string;
  time_ago_mr: string;
  audio_duration: string;
  audio_text_en: string;
  audio_text_hi: string;
  audio_text_mr: string;
  likes: number;
  comments_count: number;
  created_at: Date;
}

export interface PickupPoint {
  id: string;
  recycler_name: string;
  location: string;
  authorization_status: 'Authorized' | 'Pending Verification';
  recycler_user_id: string | null;
  created_at: Date;
}

/** One collection event at a pickup point; mirrors the SLM dataset CSV. */
export interface CollectionRecord {
  reference_id: string;
  pickup_point_id: string;
  user_name: string;
  collector_id: string | null;
  anonymous_contact_number: string;
  material_category: string;
  material_category_id: string | null;
  weight_of_waste_grams: number;
  number_of_ewaste_devices: number;
  ewaste_scrap_image_ref: string;
  price_valuation_inr: number;
  price_trend: 'Rising' | 'Falling' | 'Stable';
  mode_of_transaction: 'UPI' | 'Cash';
  transaction_ref: string;
  estimated_carbon_emission_grams: number;
  source: string;
  collected_at: Date;
}
