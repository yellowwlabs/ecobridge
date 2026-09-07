import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbAll } from '../db/pool.js';
import { resolveLocale } from '../utils/locale.js';
import type { Recycler } from '../types/index.js';

export const recyclersRouter = Router();

const FACILITY_PHOTO = 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80';

recyclersRouter.get(
  '/recyclers/nearby',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { authorized_only } = req.query as { authorized_only?: string };
    const onlyAuthorized = authorized_only === '1' || authorized_only === 'true';

    const recyclers = await dbAll<Recycler>(
      `SELECT * FROM recyclers ${onlyAuthorized ? 'WHERE authorized = TRUE' : ''}`
    );

    res.json(
      recyclers.map((r) => ({
        id: r.user_id,
        name: resolveLocale(req, r.business_name_en, r.business_name_hi, r.business_name_mr),
        avatar: r.avatar_url,
        facilityPhoto: FACILITY_PHOTO,
        authorization_status: r.authorized ? 'authorized' : 'unverified',
        rating: r.rating,
        reviewsCount: r.review_count,
        // ponytail: fixed distance until lat/lng lands on lots and recyclers.
        distance: '0.8 km',
        address: resolveLocale(req, r.address_en, r.address_hi, r.address_mr),
        phoneMasked: r.phone_masked,
        pickupAvailable: r.pickup_available,
        ratesBonus: resolveLocale(req, r.bonus_note_en, r.bonus_note_hi, r.bonus_note_mr)
      }))
    );
  })
);
