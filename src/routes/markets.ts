import { Router } from 'express';
import { MarketIndex } from '../models/MarketIndex.js';

const router = Router();

router.get('/indices', async (_req, res, next) => {
  try {
    res.json({ data: await MarketIndex.find().sort({ symbol: 1 }).lean() });
  } catch (error) {
    next(error);
  }
});

router.get('/top-gainers', async (_req, res, next) => {
  try {
    res.json({
      data: await MarketIndex.find({ changePercent: { $gt: 0 } })
        .sort({ changePercent: -1 })
        .limit(10)
        .lean(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/top-losers', async (_req, res, next) => {
  try {
    res.json({
      data: await MarketIndex.find({ changePercent: { $lt: 0 } })
        .sort({ changePercent: 1 })
        .limit(10)
        .lean(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
