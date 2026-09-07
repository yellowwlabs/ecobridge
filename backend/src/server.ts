import { createApp } from './app.js';
import { env } from './config/env.js';
import { migrate } from './db/migrate.js';
import { pool } from './db/pool.js';

async function main(): Promise<void> {
  await migrate();

  const server = createApp().listen(env.port, () => {
    console.log(`🚀 EcoBridge Backend API listening on port ${env.port}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`\n${signal} received, shutting down`);
    server.close(() => {
      void pool.end().then(() => process.exit(0));
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err: unknown) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
