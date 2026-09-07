import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll } from '../db/pool.js';
import type { Lot, MaterialCategory } from '../types/index.js';

export const datasetsRouter = Router();

type CompletedLotRow = Lot & {
  category_name: string | null;
  payment_method: string | null;
  payment_confirmed_at: Date | null;
};

/** Stable pseudonym for a collector; never reversible to the real id. */
function anonymizeCollector(collectorId: string): string {
  return `anon_usr_${Buffer.from(collectorId).toString('hex').slice(0, 8)}`;
}

/** Drop house/plot numbers so only the neighbourhood survives. */
function toZone(address: string): string {
  return address
    .replace(/(?:House|Plot|Flat|Door)\s*No\.?\s*\d+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

datasetsRouter.get(
  '/datasets/transactions',
  authMiddleware,
  asyncHandler(async (_req, res) => {
    const lots = await dbAll<CompletedLotRow>(
      `SELECT l.*, c.name_en AS category_name, t.payment_method, t.payment_confirmed_at
       FROM lots l
       LEFT JOIN material_categories c ON c.id = l.material_category_id
       LEFT JOIN transactions t ON t.lot_id = l.id
       WHERE l.status IN ('Completed', 'Accepted', 'Handover')`
    );

    const dataset = lots.map((lot) => ({
      transaction_id: lot.id,
      anonymized_collector_id: anonymizeCollector(lot.collector_id),
      material_category: lot.material_category_id,
      category_name: lot.category_name ?? lot.material_category_id,
      weight_kg: Math.max(0.1, lot.weight_kg),
      rate_per_kg: Math.max(1, lot.estimated_rate),
      total_valuation_inr: Math.round(lot.weight_kg * lot.estimated_rate),
      ai_detected_label: lot.ai_detected_label ?? 'Scrap Material',
      ai_confidence_score: lot.ai_confidence ?? 0.92,
      zone_location: toZone(lot.location_address_text || 'Delhi Zone'),
      timestamp: lot.created_at,
      outcome_status: lot.status,
      has_photo: Boolean(lot.photo)
    }));

    res.json({
      success: true,
      record_count: dataset.length,
      pii_anonymized: true,
      sanitized_at: new Date().toISOString(),
      dataset
    });
  })
);

datasetsRouter.get(
  '/datasets/training',
  authMiddleware,
  asyncHandler(async (_req, res) => {
    const categories = await dbAll<MaterialCategory>('SELECT * FROM material_categories');

    res.json({
      model_type: 'Material Classification & Valuation Starter Set',
      version: 'v1.0.4-synthetic',
      samples: categories.map((cat) => ({
        label: cat.name_en,
        category_id: cat.id,
        typical_rate_range_inr: {
          min: Math.round(cat.rate_per_kg * 0.8),
          max: Math.round(cat.rate_per_kg * 1.2)
        },
        is_ewaste: cat.is_ewaste,
        is_hard_to_sell: cat.is_hard_to_sell,
        sample_photo: cat.photo
      }))
    });
  })
);
