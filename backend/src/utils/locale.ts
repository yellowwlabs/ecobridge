import type { Request } from 'express';
import type { Lang } from '../types/index.js';

/** Resolve the request language, defaulting to Hindi. */
export function getLang(req: Request): Lang {
  const raw =
    (req.headers['accept-language'] as string | undefined) ??
    (req.query.locale as string | undefined) ??
    req.user?.preferred_language ??
    'hi';

  if (raw.startsWith('en')) return 'en';
  if (raw.startsWith('mr')) return 'mr';
  return 'hi';
}

/** Pick the field matching the request language. */
export function resolveLocale(req: Request, en: string, hi: string, mr: string): string {
  const lang = getLang(req);
  if (lang === 'en') return en;
  if (lang === 'mr') return mr;
  return hi;
}
