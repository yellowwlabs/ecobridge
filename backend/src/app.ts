import cors from 'cors';
import express, { type Express } from 'express';
import { errorHandler, notFound } from './middleware/error.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' })); // base64 photos ride in the body

  app.use('/api/v1', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
