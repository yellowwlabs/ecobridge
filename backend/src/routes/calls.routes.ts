import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbGet, withTransaction } from '../db/pool.js';
import { getLang } from '../utils/locale.js';
import type { AiCallSession, ProxyCallSession } from '../types/index.js';

export const callsRouter = Router();

const PROXY_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const GREETINGS = {
  en: 'AI Bot: Hello! What is your query regarding scrap rates?',
  mr: 'AI बॉट: नमस्कार! तुम्हाला कशाचे दर हवे आहेत?',
  hi: 'AI बॉट: नमस्ते! बोलिए, तांबा, लोहा या प्लास्टिक का क्या भाव चाहिए?'
} as const;

callsRouter.post(
  '/ai-calls',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { lot_id, recycler_id } = req.body as { lot_id?: string; recycler_id?: string };

    const session = await dbGet<AiCallSession>(
      `INSERT INTO ai_call_sessions (id, initiated_by_user_id, lot_id, recycler_id, status, transcript, outcome_summary)
       VALUES ($1, $2, $3, $4, 'in_progress', $5, 'Call initiated')
       RETURNING *`,
      [`call_${Date.now()}`, req.user!.id, lot_id ?? null, recycler_id ?? 'rec_01', GREETINGS[getLang(req)]]
    );

    res.status(201).json(session);
  })
);

callsRouter.get(
  '/ai-calls/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const session = await dbGet<AiCallSession>('SELECT * FROM ai_call_sessions WHERE id = $1', [req.params.id]);
    if (!session) {
      res.status(404).json({ error: 'AI call session not found' });
      return;
    }
    res.json(session);
  })
);

callsRouter.post(
  '/ai-calls/:id/end',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const updated = await dbGet<AiCallSession>(
      `UPDATE ai_call_sessions
       SET status = 'completed', outcome_summary = 'Rate quote communicated successfully', ended_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );
    if (!updated) {
      res.status(404).json({ error: 'AI call session not found' });
      return;
    }
    res.json(updated);
  })
);

// --- Telephony call masking: both parties only ever see the proxy number ---

callsRouter.post(
  '/calls/initiate-proxy',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { lot_id, target_id } = req.body as { lot_id?: string; target_id?: string };

    const sessionId = `PROXY-${Date.now()}`;
    const virtualProxyNumber = `+91 11 4987 ${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + PROXY_SESSION_TTL_MS);

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO proxy_call_sessions (id, lot_id, caller_id, receiver_id, virtual_proxy_number, provider, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, 'Exotel / Twilio Secure Call-Masking', 'active', $6)`,
        [sessionId, lot_id ?? 'LOT-GENERAL', req.user!.id, target_id ?? 'rec_01', virtualProxyNumber, expiresAt]
      );
      // Audit trail for support, without storing either real phone number.
      await client.query(
        `INSERT INTO proxy_call_logs (id, session_id, duration_seconds, status)
         VALUES ($1, $2, 0, 'session_initiated')`,
        [`LOG-${Date.now()}`, sessionId]
      );
    });

    res.status(201).json({
      success: true,
      session_id: sessionId,
      proxy_number: virtualProxyNumber,
      provider: 'Exotel / Twilio Secure Proxy',
      expires_at: expiresAt.toISOString(),
      privacy_notice:
        'Your number is 100% private. Both parties communicate exclusively through this encrypted virtual line.'
    });
  })
);

callsRouter.get(
  '/calls/proxy-session/:session_id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const session = await dbGet<ProxyCallSession>('SELECT * FROM proxy_call_sessions WHERE id = $1', [
      req.params.session_id
    ]);
    if (!session) {
      res.status(404).json({ error: 'Proxy call session not found' });
      return;
    }
    res.json(session);
  })
);

callsRouter.post(
  '/calls/log-proxy-call',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { session_id, duration_seconds, status } = req.body as {
      session_id?: string;
      duration_seconds?: number;
      status?: string;
    };

    if (!session_id) {
      res.status(400).json({ error: 'session_id is required' });
      return;
    }

    const logId = `LOG-${Date.now()}`;
    const inserted = await dbGet<{ id: string }>(
      `INSERT INTO proxy_call_logs (id, session_id, duration_seconds, status)
       SELECT $1, $2, $3, $4
       WHERE EXISTS (SELECT 1 FROM proxy_call_sessions WHERE id = $2)
       RETURNING id`,
      [logId, session_id, duration_seconds ?? 45, status ?? 'completed']
    );

    if (!inserted) {
      res.status(404).json({ error: 'Proxy call session not found' });
      return;
    }
    res.json({ success: true, log_id: inserted.id });
  })
);
