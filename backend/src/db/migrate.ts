import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const here = path.dirname(fileURLToPath(import.meta.url));

async function runSqlFile(name: string): Promise<void> {
  const sql = await fs.readFile(path.join(here, name), 'utf8');
  await pool.query(sql);
}

/** Apply schema then seed. Both files are idempotent, so this is safe on every boot. */
export async function migrate(): Promise<void> {
  await runSqlFile('schema.sql');
  await runSqlFile('seed.sql');
}

// `pnpm db:migrate` runs this file directly.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => console.log('✅ Schema applied and seed data ensured'))
    .catch((err: unknown) => {
      console.error('❌ Migration failed:', err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
