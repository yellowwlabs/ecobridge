import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll } from '../db/pool.js';
import { resolveLocale } from '../utils/locale.js';
import type { MaterialCategory, RateHistoryEntry } from '../types/index.js';

export const ratesRouter = Router();

ratesRouter.get(
  '/rates',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const categories = await dbAll<MaterialCategory>('SELECT * FROM material_categories');

    res.json(
      categories.map((cat) => ({
        id: cat.id,
        name: resolveLocale(req, cat.name_en, cat.name_hi, cat.name_mr),
        rate: cat.rate_per_kg,
        unit: cat.unit,
        trend: cat.trend,
        trendValue: cat.trend_value,
        icon: cat.icon,
        category: cat.category,
        is_ewaste: cat.is_ewaste,
        isHardToSell: cat.is_hard_to_sell,
        requiresSafetyWarning: cat.requires_safety_warning,
        photo: cat.photo
      }))
    );
  })
);

ratesRouter.get(
  '/rates/:category_id/history',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const history = await dbAll<RateHistoryEntry>(
      'SELECT * FROM rate_history WHERE category_id = $1 ORDER BY id DESC LIMIT 10',
      [req.params.category_id]
    );
    res.json(history);
  })
);
