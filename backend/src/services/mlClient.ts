import { env } from '../config/env.js';

export type MlTask = 'price' | 'carbon';

/** Features the trained RandomForest pipelines expect (model/src/models/schema.py). */
export interface MlFeatures {
  weight_of_waste_grams: number;
  number_of_ewaste_devices: number;
  estimated_carbon_emission_grams?: number;
  material_category: string;
  price_trend: 'Rising' | 'Falling' | 'Stable';
  mode_of_transaction: 'Cash' | 'UPI';
  recycler_location: string;
  authorization_status: 'Authorized' | 'Pending Verification';
}

const TARGET_KEY: Record<MlTask, string> = {
  price: 'predicted_price_valuation_inr',
  carbon: 'predicted_estimated_carbon_emission_grams'
};

// The Flask service is optional infrastructure. A miss must degrade, not throw,
// so the agent can still answer from the price board.
const TIMEOUT_MS = 4000;

export async function predict(task: MlTask, features: MlFeatures): Promise<number | null> {
  try {
    const response = await fetch(`${env.modelApiUrl}/predict/${task}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });

    if (!response.ok) {
      console.warn(`[ML] /predict/${task} returned HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as Record<string, unknown>;
    const value = data[TARGET_KEY[task]];
    return typeof value === 'number' ? value : null;
  } catch (err) {
    console.warn(`[ML] /predict/${task} unreachable:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * The models were trained on `material_category` label strings, not on the
 * database's category ids. Categories line up on `name_en` except this one.
 */
const NAME_OVERRIDES: Record<string, string> = {
  'Lead Battery': 'Lead-Acid Battery'
};

export function toModelCategory(nameEn: string): string {
  return NAME_OVERRIDES[nameEn] ?? nameEn;
}

/** Recycler locations the models saw during training. */
export const KNOWN_RECYCLER_LOCATIONS = [
  'Okhla Phase 2, New Delhi',
  'Mayapuri Industrial Area, Delhi',
  'Narela, New Delhi',
  'Dharavi, Mumbai',
  'Bhiwandi, Maharashtra',
  'Peenya, Bengaluru',
  'Guindy, Chennai',
  'Sanathnagar, Hyderabad',
  'Jamshedpur, Jharkhand',
  'Kanpur, Uttar Pradesh',
  'Ludhiana, Punjab',
  'Ankleshwar, Gujarat'
] as const;
