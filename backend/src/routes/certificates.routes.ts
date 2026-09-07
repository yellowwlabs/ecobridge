import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll, dbGet } from '../db/pool.js';
import type { Certificate } from '../types/index.js';

export const certificatesRouter = Router();

certificatesRouter.get(
  '/certificates',
  authMiddleware,
  asyncHandler(async (_req, res) => {
    res.json(await dbAll<Certificate>('SELECT * FROM certificates'));
  })
);

certificatesRouter.get(
  '/certificates/:transaction_id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const cert = await dbGet<Certificate>('SELECT * FROM certificates WHERE transaction_id = $1', [
      req.params.transaction_id
    ]);
    if (!cert) {
      res.status(404).json({ error: 'Digital certificate not found' });
      return;
    }
    res.json(cert);
  })
);
