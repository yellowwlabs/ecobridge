import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

// ponytail: in-memory counter, fine for one process. Swap for Redis if the API
// is ever run with more than one instance behind a load balancer.
const hits = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip ?? '127.0.0.1';
  const now = Date.now();
  const record = hits.get(ip);

  if (!record || now > record.resetTime) {
    hits.set(ip, { count: 1, resetTime: now + env.rateLimitWindowMs });
    next();
    return;
  }

  record.count += 1;
  if (record.count > env.rateLimitMax) {
    res.status(429).json({
      error: 'Rate limit exceeded. AI Assistant is busy — please try again in a moment.',
      fallback_message: 'AI Assistant is temporarily unavailable — try again in a moment.'
    });
    return;
  }

  next();
}
