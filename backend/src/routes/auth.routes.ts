import { Router } from 'express';
import { authMiddleware, signToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { dbGet } from '../db/pool.js';
import type { Recycler, User } from '../types/index.js';

export const authRouter = Router();

// OTPs are simulated for the demo; a real gateway plugs in here.
const REJECTED_OTPS = new Set(['0000', '9999', '1111']);

authRouter.post('/auth/otp/request', (req, res) => {
  const { mobile_number } = req.body as { mobile_number?: string };
  if (!mobile_number || mobile_number.length < 10) {
    res.status(400).json({ error: 'Valid 10-digit mobile number required' });
    return;
  }
  res.json({
    success: true,
    message: `OTP sent successfully to +91 ${mobile_number.slice(-10)}`,
    test_otp: '8921'
  });
});

authRouter.post(
  '/auth/otp/verify',
  asyncHandler(async (req, res) => {
    const { mobile_number, otp } = req.body as { mobile_number?: string; otp?: string };

    if (!mobile_number) {
      res.status(400).json({ error: 'Mobile number required' });
      return;
    }
    if (!otp || otp.length !== 4) {
      res.status(400).json({ error: 'Please enter a valid 4-digit OTP' });
      return;
    }
    if (REJECTED_OTPS.has(otp)) {
      res.status(401).json({ error: 'Invalid OTP code. Please enter the correct 4-digit code.' });
      return;
    }

    const formattedMobile = mobile_number.startsWith('+91') ? mobile_number : `+91${mobile_number}`;
    let user = await dbGet<User>('SELECT * FROM users WHERE mobile_number = $1', [formattedMobile]);

    if (!user) {
      user = await dbGet<User>(
        `INSERT INTO users (id, mobile_number, name, operating_area, preferred_language, active_role, is_recycler_verified)
         VALUES ($1, $2, 'राजू कबाड़ीवाला', 'ओखला Phase 2, नई दिल्ली', 'hi', 'collector', FALSE)
         RETURNING *`,
        [`usr_${Date.now()}`, formattedMobile]
      );
    }

    if (!user) {
      res.status(500).json({ error: 'Could not create user account' });
      return;
    }

    res.json({ token: signToken(user), user });
  })
);

authRouter.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await dbGet<User>('SELECT * FROM users WHERE id = $1', [req.user!.id]);
    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const recyclerProfile =
      user.active_role === 'recycler'
        ? (await dbGet<Recycler>('SELECT * FROM recyclers WHERE user_id = $1', [user.id])) ?? null
        : null;

    res.json({ ...user, recycler_profile: recyclerProfile });
  })
);

authRouter.put(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { name, operating_area, preferred_language, active_role } = req.body as Partial<User>;

    const updated = await dbGet<User>(
      `UPDATE users SET
         name = COALESCE($2, name),
         operating_area = COALESCE($3, operating_area),
         preferred_language = COALESCE($4, preferred_language),
         active_role = COALESCE($5, active_role)
       WHERE id = $1
       RETURNING *`,
      [req.user!.id, name ?? null, operating_area ?? null, preferred_language ?? null, active_role ?? null]
    );

    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(updated);
  })
);
