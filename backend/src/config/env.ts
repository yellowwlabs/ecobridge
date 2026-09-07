import path from 'node:path';
import dotenv from 'dotenv';

// The backend runs both from the repo root (`make dev`) and from its own
// directory (turbo, `pnpm --filter`). Check both; the first file that defines
// a key wins, so a package-local .env can override the shared one.
dotenv.config({
  path: [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '../.env')],
  quiet: true
});

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  databaseUrl: required('DATABASE_URL'),
  // Managed providers (Neon, Supabase, RDS) need TLS; a local socket does not.
  databaseSsl: process.env.DATABASE_SSL === 'true',

  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '30d',

  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-3.6-flash',

  // Flask service in model/ (`uv run python -m src.api.api`). Optional: the
  // agent falls back to price-board arithmetic when it is unreachable.
  modelApiUrl: process.env.MODEL_API_URL ?? 'http://127.0.0.1:5002',

  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 50)
} as const;
