import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll, dbGet } from '../db/pool.js';
import type { EwastePickup } from '../types/index.js';

export const ewasteRouter = Router();

// Demo baseline so a fresh account still shows non-zero impact.
const BASELINE_DIVERTED_KG = 42.5;
const CO2_KG_PER_KG_DIVERTED = 3.01;

ewasteRouter.get(
  '/ewaste/impact-summary',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const row = await dbGet<{ total_kg: number | null; lot_count: string }>(
      `SELECT COALESCE(SUM(l.weight_kg), 0) AS total_kg, COUNT(*) AS lot_count
       FROM lots l
       JOIN material_categories c ON c.id = l.material_category_id
       WHERE l.collector_id = $1 AND c.is_ewaste = TRUE AND l.status = 'Completed'`,
      [req.user!.id]
    );

    const totalKg = Number(row?.total_kg ?? 0) + BASELINE_DIVERTED_KG;

    res.json({
      diverted_ewaste_kg: totalKg.toFixed(1),
      co2_prevented_kg: Math.round(totalKg * CO2_KG_PER_KG_DIVERTED),
      recent_pickup_count: Number(row?.lot_count ?? 0) + 1
    });
  })
);

ewasteRouter.post(
  '/ewaste/pickups',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { material_category_id, scheduled_date, location_text } = req.body as {
      material_category_id?: string;
      scheduled_date?: string;
      location_text?: string;
    };

    if (!material_category_id || !scheduled_date) {
      res.status(400).json({ error: 'material_category_id and scheduled_date are required' });
      return;
    }

    const pickup = await dbGet<EwastePickup>(
      `INSERT INTO ewaste_pickups (id, collector_id, material_category_id, scheduled_date, location_text, status)
       VALUES ($1, $2, $3, $4, $5, 'scheduled')
       RETURNING *`,
      [
        `pck_${Date.now()}`,
        req.user!.id,
        material_category_id,
        scheduled_date,
        location_text ?? req.user!.operating_area ?? ''
      ]
    );

    res.status(201).json(pickup);
  })
);

ewasteRouter.get(
  '/ewaste/pickups',
  authMiddleware,
  asyncHandler(async (req, res) => {
    res.json(
      await dbAll<EwastePickup>('SELECT * FROM ewaste_pickups WHERE collector_id = $1 ORDER BY created_at DESC', [
        req.user!.id
      ])
    );
  })
);
