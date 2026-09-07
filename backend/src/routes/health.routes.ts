import { Router } from 'express';
import { pool } from '../db/pool.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  let database = 'up';
  try {
    await pool.query('SELECT 1');
  } catch {
    database = 'down';
  }

  res.status(database === 'up' ? 200 : 503).json({
    status: database === 'up' ? 'OK' : 'DEGRADED',
    service: 'EcoBridge Backend API',
    database,
    timestamp: new Date().toISOString()
  });
});
