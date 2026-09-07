import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbGet, withTransaction } from '../db/pool.js';
import { resolveLocale } from '../utils/locale.js';
import type { Certificate, Lot, MaterialCategory, Offer, Transaction } from '../types/index.js';

export const transactionsRouter = Router();

const COMPLETION_LOYALTY_POINTS = 100;

transactionsRouter.get(
  '/transactions/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const tx = await dbGet<Transaction>('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
    if (!tx) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const lot = await dbGet<Lot>('SELECT * FROM lots WHERE id = $1', [tx.lot_id]);
    const offer = tx.offer_id ? await dbGet<Offer>('SELECT * FROM offers WHERE id = $1', [tx.offer_id]) : null;
    const category = lot
      ? await dbGet<MaterialCategory>('SELECT * FROM material_categories WHERE id = $1', [lot.material_category_id])
      : null;

    res.json({
      ...tx,
      lot: lot ?? null,
      offer: offer ?? null,
      materialName: category ? resolveLocale(req, category.name_en, category.name_hi, category.name_mr) : ''
    });
  })
);

transactionsRouter.post(
  '/transactions/:id/confirm-handover',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tx = await dbGet<Transaction>('SELECT * FROM transactions WHERE id = $1', [id]);
    if (!tx) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const updated = await withTransaction(async (client) => {
      const result = await client.query<Transaction>(
        `UPDATE transactions SET status = 'Handover', status_step = 4, handover_confirmed_at = NOW()
         WHERE id = $1 RETURNING *`,
        [id]
      );
      await client.query(`UPDATE lots SET status = 'Handover', status_step = 4 WHERE id = $1`, [tx.lot_id]);
      return result.rows[0];
    });

    res.json(updated);
  })
);

transactionsRouter.post(
  '/transactions/:id/confirm-payment',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { payment_method, payment_reference } = req.body as {
      payment_method?: string;
      payment_reference?: string;
    };

    const tx = await dbGet<Transaction>('SELECT * FROM transactions WHERE id = $1', [id]);
    if (!tx) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const lot = await dbGet<Lot>('SELECT * FROM lots WHERE id = $1', [tx.lot_id]);
    const category = lot
      ? await dbGet<MaterialCategory>('SELECT * FROM material_categories WHERE id = $1', [lot.material_category_id])
      : null;

    const method = payment_method ?? tx.payment_method ?? 'UPI';
    const reference = payment_reference ?? `UPI-${Date.now()}`;

    // Payment, lot closure, certificate and loyalty credit are one unit of
    // work: a partial commit would leave money moved with no certificate.
    const { transaction, certificate } = await withTransaction(async (client) => {
      const txResult = await client.query<Transaction>(
        `UPDATE transactions
         SET status = 'Completed', status_step = 5, payment_method = $2, payment_reference = $3, payment_confirmed_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, method, reference]
      );

      if (lot) {
        await client.query(`UPDATE lots SET status = 'Completed', status_step = 5 WHERE id = $1`, [lot.id]);
      }

      const certResult = await client.query<Certificate>(
        `INSERT INTO certificates (
           id, transaction_id, lot_number, gps_stamp, time_stamp,
           recycler_name_at_time, payment_method_at_time, amount, weight_kg, material_category
         ) VALUES ($1, $2, $3, $4, NOW(), 'Green India Recycling Hub', $5, $6, $7, $8)
         ON CONFLICT (transaction_id) DO NOTHING
         RETURNING *`,
        [
          `cert_${Date.now()}`,
          id,
          lot?.lot_number ?? 'LOT-8921',
          lot?.location_address_text ?? 'Okhla Phase 2',
          method,
          lot?.total_price ?? 0,
          lot?.weight_kg ?? 0,
          category?.name_en ?? 'Scrap'
        ]
      );

      await client.query(
        `INSERT INTO loyalty_ledger (id, user_id, points_delta, reason)
         VALUES ($1, $2, $3, 'Scrap Lot Handover & Payment Completed')`,
        [`ledger_${Date.now()}`, lot?.collector_id ?? req.user!.id, COMPLETION_LOYALTY_POINTS]
      );

      return { transaction: txResult.rows[0], certificate: certResult.rows[0] };
    });

    // A re-confirmed payment hits ON CONFLICT DO NOTHING, so read the existing one.
    const cert =
      certificate ?? (await dbGet<Certificate>('SELECT * FROM certificates WHERE transaction_id = $1', [id]));

    res.json({ transaction, certificate: cert ?? null });
  })
);
