-- EcoBridge PostgreSQL schema. Idempotent: safe to run on every boot.

CREATE TABLE IF NOT EXISTS users (
  id                  TEXT PRIMARY KEY,
  mobile_number       TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  operating_area      TEXT NOT NULL DEFAULT '',
  preferred_language  TEXT NOT NULL DEFAULT 'hi',
  active_role         TEXT NOT NULL DEFAULT 'collector',
  is_recycler_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recyclers (
  user_id                 TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name_en        TEXT NOT NULL,
  business_name_hi        TEXT NOT NULL,
  business_name_mr        TEXT NOT NULL,
  rating                  DOUBLE PRECISION NOT NULL DEFAULT 4.8,
  review_count            INTEGER NOT NULL DEFAULT 50,
  authorized              BOOLEAN NOT NULL DEFAULT TRUE,
  payment_methods_offered JSONB NOT NULL DEFAULT '["UPI", "Cash"]'::jsonb,
  bonus_note_en           TEXT NOT NULL DEFAULT '',
  bonus_note_hi           TEXT NOT NULL DEFAULT '',
  bonus_note_mr           TEXT NOT NULL DEFAULT '',
  pickup_available        BOOLEAN NOT NULL DEFAULT TRUE,
  address_en              TEXT NOT NULL DEFAULT '',
  address_hi              TEXT NOT NULL DEFAULT '',
  address_mr              TEXT NOT NULL DEFAULT '',
  phone_masked            TEXT NOT NULL DEFAULT '',
  avatar_url              TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS material_categories (
  id                       TEXT PRIMARY KEY,
  name_en                  TEXT NOT NULL,
  name_hi                  TEXT NOT NULL,
  name_mr                  TEXT NOT NULL,
  rate_per_kg              DOUBLE PRECISION NOT NULL,
  unit                     TEXT NOT NULL DEFAULT 'kg',
  trend                    TEXT NOT NULL DEFAULT 'up',
  trend_value              TEXT NOT NULL DEFAULT '+₹0',
  icon                     TEXT NOT NULL DEFAULT 'Package',
  category                 TEXT NOT NULL DEFAULT 'standard',
  is_ewaste                BOOLEAN NOT NULL DEFAULT FALSE,
  is_hard_to_sell          BOOLEAN NOT NULL DEFAULT FALSE,
  requires_safety_warning  BOOLEAN NOT NULL DEFAULT FALSE,
  photo                    TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS rate_history (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id   TEXT NOT NULL REFERENCES material_categories(id) ON DELETE CASCADE,
  rate_per_kg   DOUBLE PRECISION NOT NULL,
  change_amount TEXT NOT NULL DEFAULT '₹0',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rate_history_category_idx ON rate_history (category_id, id DESC);

CREATE TABLE IF NOT EXISTS lots (
  id                    TEXT PRIMARY KEY,
  lot_number            TEXT UNIQUE NOT NULL,
  collector_id          TEXT NOT NULL REFERENCES users(id),
  material_category_id  TEXT NOT NULL REFERENCES material_categories(id),
  weight_kg             DOUBLE PRECISION NOT NULL,
  estimated_rate        DOUBLE PRECISION NOT NULL,
  total_price           DOUBLE PRECISION NOT NULL,
  ai_detected_label     TEXT,
  ai_confidence         DOUBLE PRECISION,
  photo                 TEXT NOT NULL DEFAULT '',
  status                TEXT NOT NULL DEFAULT 'Posted',
  status_step           INTEGER NOT NULL DEFAULT 1,
  location_geo          TEXT NOT NULL DEFAULT '',
  location_address_text TEXT NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS lots_collector_idx ON lots (collector_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lots_status_idx ON lots (status);

CREATE TABLE IF NOT EXISTS offers (
  id                  TEXT PRIMARY KEY,
  lot_id              TEXT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  recycler_id         TEXT NOT NULL REFERENCES users(id),
  rate_per_kg_offered DOUBLE PRECISION NOT NULL,
  total_amount        DOUBLE PRECISION NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending',
  rate_anomaly_flag   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS offers_lot_idx ON offers (lot_id);

CREATE TABLE IF NOT EXISTS transactions (
  id                    TEXT PRIMARY KEY,
  lot_id                TEXT NOT NULL UNIQUE REFERENCES lots(id) ON DELETE CASCADE,
  offer_id              TEXT REFERENCES offers(id),
  status                TEXT NOT NULL DEFAULT 'Accepted',
  status_step           INTEGER NOT NULL DEFAULT 3,
  payment_method        TEXT NOT NULL DEFAULT 'UPI',
  payment_reference     TEXT NOT NULL DEFAULT '',
  handover_confirmed_at TIMESTAMPTZ,
  payment_confirmed_at  TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id                      TEXT PRIMARY KEY,
  transaction_id          TEXT UNIQUE NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  lot_number              TEXT NOT NULL,
  gps_stamp               TEXT NOT NULL,
  time_stamp              TIMESTAMPTZ NOT NULL,
  recycler_name_at_time   TEXT NOT NULL,
  payment_method_at_time  TEXT NOT NULL,
  amount                  DOUBLE PRECISION NOT NULL,
  weight_kg               DOUBLE PRECISION NOT NULL,
  material_category       TEXT NOT NULL
);

-- Append-only ledger: rows are never updated or deleted.
CREATE TABLE IF NOT EXISTS loyalty_ledger (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  points_delta  INTEGER NOT NULL,
  reason        TEXT NOT NULL,
  upi_id        TEXT NOT NULL DEFAULT '',
  amount_rupees DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS loyalty_ledger_user_idx ON loyalty_ledger (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ewaste_pickups (
  id                   TEXT PRIMARY KEY,
  collector_id         TEXT NOT NULL REFERENCES users(id),
  material_category_id TEXT NOT NULL REFERENCES material_categories(id),
  scheduled_date       TEXT NOT NULL,
  location_text        TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'scheduled',
  linked_lot_id        TEXT REFERENCES lots(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_call_sessions (
  id                    TEXT PRIMARY KEY,
  initiated_by_user_id  TEXT NOT NULL REFERENCES users(id),
  lot_id                TEXT,
  recycler_id           TEXT,
  status                TEXT NOT NULL DEFAULT 'initiated',
  transcript            TEXT NOT NULL DEFAULT '',
  outcome_summary       TEXT NOT NULL DEFAULT '',
  started_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at              TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS proxy_call_sessions (
  id                   TEXT PRIMARY KEY,
  lot_id               TEXT,
  caller_id            TEXT NOT NULL REFERENCES users(id),
  receiver_id          TEXT NOT NULL,
  virtual_proxy_number TEXT NOT NULL,
  provider             TEXT NOT NULL DEFAULT 'Exotel / Twilio Secure Proxy',
  status               TEXT NOT NULL DEFAULT 'active',
  expires_at           TIMESTAMPTZ NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proxy_call_logs (
  id               TEXT PRIMARY KEY,
  session_id       TEXT NOT NULL REFERENCES proxy_call_sessions(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'completed',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id       TEXT PRIMARY KEY,
  user_id  TEXT NOT NULL REFERENCES users(id),
  type     TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  title_mr TEXT NOT NULL,
  body_en  TEXT NOT NULL,
  body_hi  TEXT NOT NULL,
  body_mr  TEXT NOT NULL,
  sent_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS notification_logs_user_idx ON notification_logs (user_id, sent_at DESC);

CREATE TABLE IF NOT EXISTS faq_entries (
  id          TEXT PRIMARY KEY,
  question_en TEXT NOT NULL,
  question_hi TEXT NOT NULL,
  question_mr TEXT NOT NULL,
  answer_en   TEXT NOT NULL,
  answer_hi   TEXT NOT NULL,
  answer_mr   TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general',
  sort_order  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS community_posts (
  id             TEXT PRIMARY KEY,
  author_en      TEXT NOT NULL,
  author_hi      TEXT NOT NULL,
  author_mr      TEXT NOT NULL,
  avatar         TEXT NOT NULL,
  location_en    TEXT NOT NULL,
  location_hi    TEXT NOT NULL,
  location_mr    TEXT NOT NULL,
  time_ago_en    TEXT NOT NULL,
  time_ago_hi    TEXT NOT NULL,
  time_ago_mr    TEXT NOT NULL,
  audio_duration TEXT NOT NULL,
  audio_text_en  TEXT NOT NULL,
  audio_text_hi  TEXT NOT NULL,
  audio_text_mr  TEXT NOT NULL,
  likes          INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Pickup points and their collection records.
--
-- Shape mirrors model/__data__/slm_synthetic_dataset_corrected.csv one row per
-- collection. The recycler-side facts in that CSV (name, location,
-- authorization status) are functionally dependent on nearby_recycler_id, so
-- they are normalised out into pickup_points instead of repeating per row.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS pickup_points (
  id                   TEXT PRIMARY KEY,             -- CSV nearby_recycler_id, e.g. 'RCY-1056'
  recycler_name        TEXT NOT NULL,                -- CSV recycler_name
  location             TEXT NOT NULL,                -- CSV recycler_location, 'Area, City'
  authorization_status TEXT NOT NULL DEFAULT 'Pending Verification'
    CHECK (authorization_status IN ('Authorized', 'Pending Verification')),
  recycler_user_id     TEXT REFERENCES users(id),    -- set when the point maps to an app account
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pickup_points_location_idx ON pickup_points (location);

CREATE TABLE IF NOT EXISTS collections (
  reference_id                    TEXT PRIMARY KEY,  -- CSV reference_id, e.g. 'REF-100000'
  pickup_point_id                 TEXT NOT NULL REFERENCES pickup_points(id) ON DELETE CASCADE,
  user_name                       TEXT NOT NULL,     -- CSV user_name
  collector_id                    TEXT REFERENCES users(id),
  anonymous_contact_number        TEXT NOT NULL DEFAULT '',
  material_category               TEXT NOT NULL,     -- CSV label, kept verbatim
  material_category_id            TEXT REFERENCES material_categories(id),
  weight_of_waste_grams           DOUBLE PRECISION NOT NULL CHECK (weight_of_waste_grams >= 0),
  number_of_ewaste_devices        INTEGER NOT NULL DEFAULT 0 CHECK (number_of_ewaste_devices >= 0),
  ewaste_scrap_image_ref          TEXT NOT NULL DEFAULT '',
  price_valuation_inr             DOUBLE PRECISION NOT NULL CHECK (price_valuation_inr >= 0),
  price_trend                     TEXT NOT NULL DEFAULT 'Stable'
    CHECK (price_trend IN ('Rising', 'Falling', 'Stable')),
  mode_of_transaction             TEXT NOT NULL
    CHECK (mode_of_transaction IN ('UPI', 'Cash')),
  transaction_ref                 TEXT NOT NULL UNIQUE,  -- CSV transaction_id
  estimated_carbon_emission_grams DOUBLE PRECISION NOT NULL DEFAULT 0,
  source                          TEXT NOT NULL DEFAULT 'app',  -- 'app' | 'csv_import'
  collected_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS collections_point_idx ON collections (pickup_point_id, collected_at DESC);
CREATE INDEX IF NOT EXISTS collections_category_idx ON collections (material_category_id);
CREATE INDEX IF NOT EXISTS collections_collector_idx ON collections (collector_id, collected_at DESC);
