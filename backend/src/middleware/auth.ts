import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthUser } from '../types/index.js';

// Demo identity used when no token is supplied, so the app is explorable
// without signing in. Remove once the client always sends a token.
const DEMO_USER: AuthUser = {
  id: 'usr_collector',
  mobile_number: '+919871234567',
  name: 'राजू कबाड़ीवाला',
  preferred_language: 'hi',
  active_role: 'collector'
};

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    req.user = DEMO_USER;
    next();
    return;
  }

  const token = authHeader.slice('Bearer '.length);
  try {
    req.user = jwt.verify(token, env.jwtSecret) as AuthUser;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      mobile_number: user.mobile_number,
      name: user.name,
      preferred_language: user.preferred_language,
      active_role: user.active_role
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}
