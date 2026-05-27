import { Router } from 'express';
import { Holding } from '../models/Holding.js';

const router = Router();

router.get('/holdings', async (_req, res, next) => {
  try {
    res.json({ data: await Holding.find().limit(100) });
  } catch (error) {
    next(error);
  }
});

router.get('/positions', (_req, res) => res.json({ data: [] }));
router.get('/pnl', (_req, res) => {
  res.json({ data: { realised: 0, unrealised: 0, dayPnl: 0 } });
});
router.get('/performance', (_req, res) => {
  res.json({ data: { alpha: 0, beta: 0, sharpeRatio: 0, maxDrawdown: 0 } });
});
router.get('/diversification', (_req, res) => {
  res.json({ data: { hhi: 0, sectors: [] } });
});

export default router;
