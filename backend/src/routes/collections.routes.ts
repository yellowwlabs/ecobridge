import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll, dbGet } from '../db/pool.js';
import type { CollectionRecord, PickupPoint } from '../types/index.js';

export const collectionsRouter = Router();

const PRICE_TRENDS = ['Rising', 'Falling', 'Stable'];
const PAYMENT_MODES = ['UPI', 'Cash'];
const MAX_LIMIT = 200;

/** Clamp a caller-supplied ?limit= into [1, MAX_LIMIT]. */
function toLimit(raw: unknown, fallback = 50): number {
  const n = Number.parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, MAX_LIMIT);
}

collectionsRouter.get(
  '/pickup-points',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { location, authorization_status } = req.query as {
      location?: string;
      authorization_status?: string;
    };

    res.json(
      await dbAll<PickupPoint & { collection_count: number }>(
        `SELECT p.*, COUNT(c.reference_id)::int AS collection_count
         FROM pickup_points p
         LEFT JOIN collections c ON c.pickup_point_id = p.id
         WHERE ($1::text IS NULL OR p.location ILIKE '%' || $1 || '%')
           AND ($2::text IS NULL OR p.authorization_status = $2)
         GROUP BY p.id
         ORDER BY p.recycler_name`,
        [location ?? null, authorization_status ?? null]
      )
    );
  })
);

collectionsRouter.get(
  '/pickup-points/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const point = await dbGet<PickupPoint>('SELECT * FROM pickup_points WHERE id = $1', [req.params.id]);
    if (!point) {
      res.status(404).json({ error: 'Pickup point not found' });
      return;
    }
    res.json(point);
  })
);

/** Collection records for one pickup point, newest first. */
collectionsRouter.get(
  '/pickup-points/:id/collections',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { material_category, limit, offset } = req.query as {
      material_category?: string;
      limit?: string;
      offset?: string;
    };

    const rows = await dbAll<CollectionRecord>(
      `SELECT * FROM collections
       WHERE pickup_point_id = $1
         AND ($2::text IS NULL OR material_category = $2)
       ORDER BY collected_at DESC, reference_id DESC
       LIMIT $3 OFFSET $4`,
      [req.params.id, material_category ?? null, toLimit(limit), Math.max(0, Number.parseInt(offset ?? '0', 10) || 0)]
    );

    res.json(rows);
  })
);

/** Aggregate view of everything collected at one pickup point. */
collectionsRouter.get(
  '/pickup-points/:id/summary',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const point = await dbGet<PickupPoint>('SELECT * FROM pickup_points WHERE id = $1', [req.params.id]);
    if (!point) {
      res.status(404).json({ error: 'Pickup point not found' });
      return;
    }

    const totals = await dbGet<{
      collection_count: number;
      total_weight_grams: number;
      total_valuation_inr: number;
      total_ewaste_devices: number;
      total_carbon_grams: number;
    }>(
      `SELECT COUNT(*)::int AS collection_count,
              COALESCE(SUM(weight_of_waste_grams), 0) AS total_weight_grams,
              COALESCE(SUM(price_valuation_inr), 0) AS total_valuation_inr,
              COALESCE(SUM(number_of_ewaste_devices), 0)::int AS total_ewaste_devices,
              COALESCE(SUM(estimated_carbon_emission_grams), 0) AS total_carbon_grams
       FROM collections WHERE pickup_point_id = $1`,
      [req.params.id]
    );

    const byCategory = await dbAll<{
      material_category: string;
      collection_count: number;
      weight_grams: number;
      valuation_inr: number;
    }>(
      `SELECT material_category,
              COUNT(*)::int AS collection_count,
              SUM(weight_of_waste_grams) AS weight_grams,
              SUM(price_valuation_inr) AS valuation_inr
       FROM collections WHERE pickup_point_id = $1
       GROUP BY material_category
       ORDER BY valuation_inr DESC`,
      [req.params.id]
    );

    res.json({
      pickup_point: point,
      totals: {
        ...totals,
        total_weight_kg: Number(((totals?.total_weight_grams ?? 0) / 1000).toFixed(2)),
        total_carbon_kg: Number(((totals?.total_carbon_grams ?? 0) / 1000).toFixed(2))
      },
      by_material_category: byCategory
    });
  })
);

/** Record a new collection at a pickup point. */
collectionsRouter.post(
  '/pickup-points/:id/collections',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const body = req.body as Partial<CollectionRecord>;
    const {
      user_name,
      material_category,
      weight_of_waste_grams,
      price_valuation_inr,
      mode_of_transaction,
      transaction_ref
    } = body;

    if (!user_name || !material_category || !mode_of_transaction || !transaction_ref) {
      res.status(400).json({
        error: 'user_name, material_category, mode_of_transaction and transaction_ref are required'
      });
      return;
    }
    if (!PAYMENT_MODES.includes(mode_of_transaction)) {
      res.status(400).json({ error: `mode_of_transaction must be one of ${PAYMENT_MODES.join(', ')}` });
      return;
    }
    if (body.price_trend && !PRICE_TRENDS.includes(body.price_trend)) {
      res.status(400).json({ error: `price_trend must be one of ${PRICE_TRENDS.join(', ')}` });
      return;
    }

    const weight = Number(weight_of_waste_grams);
    const valuation = Number(price_valuation_inr);
    if (!Number.isFinite(weight) || weight < 0 || !Number.isFinite(valuation) || valuation < 0) {
      res.status(400).json({ error: 'weight_of_waste_grams and price_valuation_inr must be non-negative numbers' });
      return;
    }

    const point = await dbGet<PickupPoint>('SELECT id FROM pickup_points WHERE id = $1', [req.params.id]);
    if (!point) {
      res.status(404).json({ error: 'Pickup point not found' });
      return;
    }

    const created = await dbGet<CollectionRecord>(
      `INSERT INTO collections (
         reference_id, pickup_point_id, user_name, anonymous_contact_number,
         material_category, material_category_id, weight_of_waste_grams,
         number_of_ewaste_devices, ewaste_scrap_image_ref, price_valuation_inr,
         price_trend, mode_of_transaction, transaction_ref,
         estimated_carbon_emission_grams, collector_id, source
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'app')
       RETURNING *`,
      [
        body.reference_id ?? `REF-${Date.now()}`,
        req.params.id,
        user_name,
        body.anonymous_contact_number ?? '',
        material_category,
        body.material_category_id ?? null,
        weight,
        Number(body.number_of_ewaste_devices ?? 0) || 0,
        body.ewaste_scrap_image_ref ?? '',
        valuation,
        body.price_trend ?? 'Stable',
        mode_of_transaction,
        transaction_ref,
        Number(body.estimated_carbon_emission_grams ?? 0) || 0,
        req.user!.id
      ]
    );

    res.status(201).json(created);
  })
);

/** Cross-point rollup, so the dashboard needs one call instead of N. */
collectionsRouter.get(
  '/collections/stats',
  authMiddleware,
  asyncHandler(async (_req, res) => {
    const byPoint = await dbAll(
      `SELECT p.id, p.recycler_name, p.location, p.authorization_status,
              COUNT(c.reference_id)::int AS collection_count,
              COALESCE(SUM(c.weight_of_waste_grams), 0) / 1000 AS weight_kg,
              COALESCE(SUM(c.price_valuation_inr), 0) AS valuation_inr
       FROM pickup_points p
       LEFT JOIN collections c ON c.pickup_point_id = p.id
       GROUP BY p.id
       ORDER BY valuation_inr DESC`
    );

    const trends = await dbAll(
      `SELECT price_trend, COUNT(*)::int AS collection_count
       FROM collections GROUP BY price_trend ORDER BY collection_count DESC`
    );

    res.json({ by_pickup_point: byPoint, by_price_trend: trends });
  })
);
