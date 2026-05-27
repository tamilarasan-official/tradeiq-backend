import { Router } from 'express';

const router = Router();

router.get('/me', (_req, res) => {
  res.json({
    data: {
      fullName: 'TradeIQ Investor',
      email: 'investor@tradeiq.app',
      mobile: '+91 98765 43210',
      kycStatus: 'Pending',
      studyGroup: 'APP',
      securityStatus: 'Enabled',
    },
  });
});

export default router;
