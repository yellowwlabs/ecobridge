import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll, dbGet, dbRun } from '../db/pool.js';
import { resolveLocale } from '../utils/locale.js';
import type { Lot, MaterialCategory } from '../types/index.js';

export const lotsRouter = Router();

lotsRouter.post(
  '/lots',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { material_category_id, weight_kg, photo, location_address_text } = req.body as {
      material_category_id?: string;
      weight_kg?: number;
      photo?: string;
      location_address_text?: string;
    };

    if (!material_category_id || !weight_kg) {
      res.status(400).json({ error: 'material_category_id and weight_kg are required' });
      return;
    }

    const category = await dbGet<MaterialCategory>('SELECT * FROM material_categories WHERE id = $1', [
      material_category_id
    ]);
    if (!category) {
      res.status(404).json({ error: 'Material category not found' });
      return;
    }

    const lotId = `LOT-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalPrice = Math.round(weight_kg * category.rate_per_kg);

    const lot = await dbGet<Lot>(
      `INSERT INTO lots (
         id, lot_number, collector_id, material_category_id, weight_kg, estimated_rate, total_price,
         photo, status, status_step, location_address_text
       ) VALUES ($1, $1, $2, $3, $4, $5, $6, $7, 'Posted', 1, $8)
       RETURNING *`,
      [
        lotId,
        req.user!.id,
        material_category_id,
        weight_kg,
        category.rate_per_kg,
        totalPrice,
        photo ?? category.photo,
        location_address_text ?? req.user!.operating_area ?? 'Okhla Phase 2, New Delhi'
      ]
    );

    res.status(201).json(lot);
  })
);

lotsRouter.get(
  '/lots',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { collector_id, status } = req.query as { collector_id?: string; status?: string };

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (collector_id) {
      params.push(collector_id);
      conditions.push(`collector_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const lots = await dbAll<Lot>(`SELECT * FROM lots ${where} ORDER BY created_at DESC`, params);
    res.json(lots);
  })
);

lotsRouter.get(
  '/lots/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const lot = await dbGet<Lot>('SELECT * FROM lots WHERE id = $1', [req.params.id]);
    if (!lot) {
      res.status(404).json({ error: 'Lot not found' });
      return;
    }

    const category = await dbGet<MaterialCategory>('SELECT * FROM material_categories WHERE id = $1', [
      lot.material_category_id
    ]);

    res.json({
      ...lot,
      materialName: category
        ? {
            en: category.name_en,
            hi: category.name_hi,
            mr: category.name_mr,
            resolved: resolveLocale(req, category.name_en, category.name_hi, category.name_mr)
          }
        : null
    });
  })
);

lotsRouter.post(
  '/lots/:id/photo-scan',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lot = await dbGet<Lot>('SELECT * FROM lots WHERE id = $1', [id]);
    if (!lot) {
      res.status(404).json({ error: 'Lot not found' });
      return;
    }

    const category = await dbGet<MaterialCategory>('SELECT * FROM material_categories WHERE id = $1', [
      lot.material_category_id
    ]);
    const confidence = 0.94;
    const label = category?.name_en ?? 'Metal Scrap';

    await dbRun('UPDATE lots SET ai_detected_label = $1, ai_confidence = $2 WHERE id = $3', [label, confidence, id]);

    res.json({
      lot_id: id,
      ai_detected_label: label,
      ai_confidence: confidence,
      category_id: category?.id ?? 'copper'
    });
  })
);
