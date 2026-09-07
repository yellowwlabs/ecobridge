import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll } from '../db/pool.js';
import { resolveLocale } from '../utils/locale.js';
import type { CommunityPost } from '../types/index.js';

export const communityRouter = Router();

communityRouter.get(
  '/community/feed',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const posts = await dbAll<CommunityPost>('SELECT * FROM community_posts ORDER BY created_at DESC');

    res.json(
      posts.map((p) => ({
        id: p.id,
        author: resolveLocale(req, p.author_en, p.author_hi, p.author_mr),
        avatar: p.avatar,
        location: resolveLocale(req, p.location_en, p.location_hi, p.location_mr),
        timeAgo: resolveLocale(req, p.time_ago_en, p.time_ago_hi, p.time_ago_mr),
        audioDuration: p.audio_duration,
        audioText: {
          en: p.audio_text_en,
          hi: p.audio_text_hi,
          mr: p.audio_text_mr,
          resolved: resolveLocale(req, p.audio_text_en, p.audio_text_hi, p.audio_text_mr)
        },
        likes: p.likes,
        commentsCount: p.comments_count
      }))
    );
  })
);
