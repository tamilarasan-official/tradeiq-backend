import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth.js';
import { User } from '../models/User.js';

const router = Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(new Types.ObjectId((req as AuthenticatedRequest).userId)).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  res.json({
    data: {
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile ?? 'Not added',
        kycStatus: user.kycStatus,
        studyGroup: user.studyGroup,
        securityStatus: user.biometricEnabled ? 'Enabled' : 'Disabled',
    },
  });
  } catch (error) {
    next(error);
  }
});

export default router;
