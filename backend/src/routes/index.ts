import { Router } from 'express';
import { aiRouter } from './ai.routes.js';
import { authRouter } from './auth.routes.js';
import { callsRouter } from './calls.routes.js';
import { certificatesRouter } from './certificates.routes.js';
import { collectionsRouter } from './collections.routes.js';
import { communityRouter } from './community.routes.js';
import { datasetsRouter } from './datasets.routes.js';
import { ewasteRouter } from './ewaste.routes.js';
import { faqRouter } from './faq.routes.js';
import { healthRouter } from './health.routes.js';
import { lotsRouter } from './lots.routes.js';
import { loyaltyRouter } from './loyalty.routes.js';
import { notificationsRouter } from './notifications.routes.js';
import { offersRouter } from './offers.routes.js';
import { ratesRouter } from './rates.routes.js';
import { recyclersRouter } from './recyclers.routes.js';
import { transactionsRouter } from './transactions.routes.js';

/** Everything mounted under /api/v1. */
export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(ratesRouter);
apiRouter.use(lotsRouter);
apiRouter.use(offersRouter);
apiRouter.use(transactionsRouter);
apiRouter.use(recyclersRouter);
apiRouter.use(certificatesRouter);
apiRouter.use(collectionsRouter);
apiRouter.use(loyaltyRouter);
apiRouter.use(ewasteRouter);
apiRouter.use(callsRouter);
apiRouter.use(notificationsRouter);
apiRouter.use(faqRouter);
apiRouter.use(communityRouter);
apiRouter.use(datasetsRouter);
apiRouter.use(aiRouter);
