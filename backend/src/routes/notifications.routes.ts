import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll, dbRun } from '../db/pool.js';
import { resolveLocale } from '../utils/locale.js';
import type { NotificationLog } from '../types/index.js';

export const notificationsRouter = Router();

notificationsRouter.get(
  '/notifications',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const logs = await dbAll<NotificationLog>(
      'SELECT * FROM notification_logs WHERE user_id = $1 ORDER BY sent_at DESC',
      [req.user!.id]
    );

    res.json(
      logs.map((n) => ({
        id: n.id,
        type: n.type,
        title: resolveLocale(req, n.title_en, n.title_hi, n.title_mr),
        body: resolveLocale(req, n.body_en, n.body_hi, n.body_mr),
        sent_at: n.sent_at,
        read_at: n.read_at
      }))
    );
  })
);

notificationsRouter.post(
  '/notifications/:id/read',
  authMiddleware,
  asyncHandler(async (req, res) => {
    // Scoped to the caller so one user cannot mark another's notification read.
    const updated = await dbRun('UPDATE notification_logs SET read_at = NOW() WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user!.id
    ]);

    if (updated === 0) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ success: true });
  })
);
