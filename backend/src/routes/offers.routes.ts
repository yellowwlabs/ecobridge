import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll, dbGet, withTransaction } from '../db/pool.js';
import { resolveLocale } from '../utils/locale.js';
import type { Lot, MaterialCategory, Offer, Recycler, Transaction } from '../types/index.js';

export const offersRouter = Router();

// An offer this far from the board rate is flagged for review, not blocked.
const ANOMALY_HIGH = 1.35;
const ANOMALY_LOW = 0.65;

offersRouter.get(
  '/lots/:id/offers',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lot = await dbGet<Lot>('SELECT id FROM lots WHERE id = $1', [id]);
    if (!lot) {
      res.status(404).json({ error: 'Lot not found' });
      return;
    }

    const rows = await dbAll<Offer & { recycler: Recycler | null }>(
      `SELECT o.*, to_jsonb(r.*) AS recycler
       FROM offers o
       LEFT JOIN recyclers r ON r.user_id = o.recycler_id
       WHERE o.lot_id = $1
       ORDER BY o.total_amount DESC`,
      [id]
    );

    res.json(
      rows.map(({ recycler, ...offer }) => ({
        ...offer,
        recycler: recycler
          ? {
              id: recycler.user_id,
              name: resolveLocale(req, recycler.business_name_en, recycler.business_name_hi, recycler.business_name_mr),
              phone: recycler.phone_masked,
              authorized: recycler.authorized
            }
          : null
      }))
    );
  })
);

offersRouter.post(
  '/lots/:id/offers',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rate_per_kg_offered } = req.body as { rate_per_kg_offered?: number };

    if (typeof rate_per_kg_offered !== 'number' || rate_per_kg_offered <= 0) {
      res.status(400).json({ error: 'rate_per_kg_offered must be a positive number' });
      return;
    }

    const lot = await dbGet<Lot>('SELECT * FROM lots WHERE id = $1', [id]);
    if (!lot) {
      res.status(404).json({ error: 'Lot not found' });
      return;
    }

    const category = await dbGet<MaterialCategory>('SELECT * FROM material_categories WHERE id = $1', [
      lot.material_category_id
    ]);
    const marketRate = category?.rate_per_kg ?? lot.estimated_rate;
    const isAnomaly =
      rate_per_kg_offered > marketRate * ANOMALY_HIGH || rate_per_kg_offered < marketRate * ANOMALY_LOW;

    const newOffer = await withTransaction(async (client) => {
      const inserted = await client.query<Offer>(
        `INSERT INTO offers (id, lot_id, recycler_id, rate_per_kg_offered, total_amount, status, rate_anomaly_flag)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6)
         RETURNING *`,
        [
          `off_${Date.now()}`,
          id,
          req.user!.id,
          rate_per_kg_offered,
          Math.round(lot.weight_kg * rate_per_kg_offered),
          isAnomaly
        ]
      );
      await client.query(`UPDATE lots SET status = 'Quoted', status_step = 2 WHERE id = $1`, [id]);
      return inserted.rows[0];
    });

    res.status(201).json(newOffer);
  })
);

offersRouter.post(
  '/offers/:id/select',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const offer = await dbGet<Offer>('SELECT * FROM offers WHERE id = $1', [id]);
    if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
      return;
    }

    const lot = await dbGet<Lot>('SELECT * FROM lots WHERE id = $1', [offer.lot_id]);
    if (!lot) {
      res.status(404).json({ error: 'Associated lot not found' });
      return;
    }

    // Selecting one offer rejects its siblings and opens the transaction —
    // all of it has to land together or not at all.
    const transaction = await withTransaction(async (client) => {
      await client.query(`UPDATE offers SET status = 'selected' WHERE id = $1`, [id]);
      await client.query(`UPDATE offers SET status = 'rejected' WHERE lot_id = $1 AND id <> $2`, [offer.lot_id, id]);
      await client.query(
        `UPDATE lots SET status = 'Accepted', status_step = 3, estimated_rate = $2, total_price = $3 WHERE id = $1`,
        [lot.id, offer.rate_per_kg_offered, offer.total_amount]
      );

      const result = await client.query<Transaction>(
        `INSERT INTO transactions (id, lot_id, offer_id, status, status_step, payment_method)
         VALUES ($1, $2, $3, 'Accepted', 3, 'UPI')
         ON CONFLICT (lot_id) DO UPDATE
           SET offer_id = EXCLUDED.offer_id, status = 'Accepted', status_step = 3
         RETURNING *`,
        [`tx_${Date.now()}`, lot.id, id]
      );
      return result.rows[0];
    });

    res.json({ success: true, transaction, selected_offer: offer });
  })
);
