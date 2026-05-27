import { Router } from 'express';

const router = Router();

const quotes = [
  { symbol: 'NIFTY 50', ltp: 24782.4, changePercent: 0.42 },
  { symbol: 'SENSEX', ltp: 81220.7, changePercent: 0.31 },
  { symbol: 'BANK NIFTY', ltp: 53420.2, changePercent: -0.18 },
];

router.get('/indices', (_req, res) => res.json({ data: quotes }));
router.get('/top-gainers', (_req, res) => res.json({ data: [] }));
router.get('/top-losers', (_req, res) => res.json({ data: [] }));

export default router;
