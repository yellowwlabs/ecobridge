import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll } from '../db/pool.js';
import { resolveLocale } from '../utils/locale.js';
import type { FaqEntry } from '../types/index.js';

export const faqRouter = Router();

faqRouter.get(
  '/faq',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { category } = req.query as { category?: string };

    const faqs = await dbAll<FaqEntry>(
      `SELECT * FROM faq_entries ${category ? 'WHERE category = $1' : ''} ORDER BY sort_order ASC`,
      category ? [category] : []
    );

    res.json(
      faqs.map((f) => ({
        id: f.id,
        question: resolveLocale(req, f.question_en, f.question_hi, f.question_mr),
        answer: resolveLocale(req, f.answer_en, f.answer_hi, f.answer_mr),
        category: f.category
      }))
    );
  })
);
