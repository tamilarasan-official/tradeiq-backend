import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    data: {
      summary: {
        title: 'Home',
        primaryMetric: '+INR 12,420 today',
        invested: 'INR 7,90,000',
        current: 'INR 8,42,500',
      },
      watchlist: [
        { symbol: 'RELIANCE', exchange: 'NSE', price: '2,850.00', change: '+1.20%' },
        { symbol: 'TCS', exchange: 'NSE', price: '4,025.40', change: '-0.42%' },
        { symbol: 'INFY', exchange: 'NSE', price: '1,510.10', change: '+0.76%' },
      ],
      holdings: [
        { symbol: 'RELIANCE', quantity: '10 qty', pnl: '+8.3%' },
        { symbol: 'TCS', quantity: '3 qty', pnl: '-1.2%' },
        { symbol: 'INFY', quantity: '5 qty', pnl: '+4.1%' },
      ],
      orders: [
        { symbol: 'RELIANCE', detail: 'BUY x 10', status: 'COMPLETE' },
        { symbol: 'TCS', detail: 'SELL x 2', status: 'OPEN' },
        { symbol: 'INFY', detail: 'BUY x 5', status: 'PENDING' },
      ],
    },
  });
});

export default router;
