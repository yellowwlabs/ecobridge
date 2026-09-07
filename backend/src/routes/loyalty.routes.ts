import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll, withTransaction } from '../db/pool.js';
import type { LoyaltyLedgerEntry } from '../types/index.js';

export const loyaltyRouter = Router();

const POINTS_PER_RUPEE = 10;

loyaltyRouter.get(
  '/loyalty/balance',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const rows = await dbAll<LoyaltyLedgerEntry>(
      'SELECT * FROM loyalty_ledger WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.id]
    );
    const points = rows.reduce((sum, r) => sum + r.points_delta, 0);

    res.json({
      points,
      rupeesEquivalent: Math.floor(points / POINTS_PER_RUPEE),
      conversionHistory: rows
        .filter((r) => r.points_delta < 0)
        .map((r) => ({
          id: r.id,
          points: Math.abs(r.points_delta),
          amountRupees: r.amount_rupees,
          date: r.created_at,
          upiId: r.upi_id
        }))
    });
  })
);

loyaltyRouter.post(
  '/loyalty/convert-to-upi',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { points, upi_id } = req.body as { points?: number; upi_id?: string };
    const redeemPoints = points ?? 1250;

    if (redeemPoints <= 0) {
      res.status(400).json({ error: 'Points to redeem must be positive' });
      return;
    }

    const ledgerId = `CNV-${Date.now()}`;
    const amountRupees = Math.floor(redeemPoints / POINTS_PER_RUPEE);
    const upiId = upi_id ?? 'raju@upi';

    // Balance check and debit share one transaction so two concurrent
    // redemptions cannot both pass the check and overdraw the balance. The
    // user row is the lock: FOR UPDATE cannot be combined with an aggregate.
    const entry = await withTransaction(async (client) => {
      await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [req.user!.id]);

      const balanceResult = await client.query<{ balance: number | null }>(
        'SELECT COALESCE(SUM(points_delta), 0) AS balance FROM loyalty_ledger WHERE user_id = $1',
        [req.user!.id]
      );
      const balance = Number(balanceResult.rows[0]?.balance ?? 0);
      if (balance < redeemPoints) return null;

      const inserted = await client.query<LoyaltyLedgerEntry>(
        `INSERT INTO loyalty_ledger (id, user_id, points_delta, reason, upi_id, amount_rupees)
         VALUES ($1, $2, $3, 'UPI Redemption Payout', $4, $5)
         RETURNING *`,
        [ledgerId, req.user!.id, -redeemPoints, upiId, amountRupees]
      );
      return inserted.rows[0];
    });

    if (!entry) {
      res.status(400).json({ error: 'Insufficient loyalty points balance' });
      return;
    }

    res.json({
      success: true,
      receipt: {
        id: entry.id,
        pointsRedeemed: redeemPoints,
        amountTransferred: amountRupees,
        upiId,
        status: 'SUCCESS',
        timestamp: entry.created_at
      }
    });
  })
);
