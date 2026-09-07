import pg from 'pg';
import { env } from '../config/env.js';

// pg returns NUMERIC/BIGINT as strings to avoid precision loss. Every numeric
// column in this schema is double precision or int, so parsing is safe here.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, Number.parseFloat);
pg.types.setTypeParser(pg.types.builtins.INT8, Number.parseInt);

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined
});

// An error on an idle client (server restart, dropped connection) is emitted on
// the pool. Without a listener Node treats it as unhandled and kills the
// process; the pool discards the bad client and reconnects on its own.
pool.on('error', (err) => {
  console.error('[Postgres] Idle client error:', err.message);
});

/** Run a statement, returning affected row count. */
export async function dbRun(sql: string, params: unknown[] = []): Promise<number> {
  const result = await pool.query(sql, params);
  return result.rowCount ?? 0;
}

/** First matching row, or undefined. */
export async function dbGet<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  const result = await pool.query<T extends pg.QueryResultRow ? T : never>(sql, params);
  return result.rows[0] as T | undefined;
}

/** All matching rows. */
export async function dbAll<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query<T extends pg.QueryResultRow ? T : never>(sql, params);
  return result.rows as T[];
}

/** Run a callback inside a transaction, rolling back on throw. */
export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
