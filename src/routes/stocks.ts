import { Router } from 'express';
import { StockQuote } from '../models/StockQuote.js';

const router = Router();

router.get('/search', async (req, res, next) => {
  try {
  const query = String(req.query.q ?? '').toUpperCase();
    const stocks = await StockQuote.find({
      $or: [
        { symbol: { $regex: query, $options: 'i' } },
        { companyName: { $regex: query, $options: 'i' } },
      ],
    })
      .sort({ symbol: 1 })
      .limit(25)
      .lean();

  res.json({
      data: stocks,
  });
  } catch (error) {
    next(error);
  }
});

router.get('/:symbol', async (req, res, next) => {
  try {
  const symbol = req.params.symbol.toUpperCase();
    const stock = await StockQuote.findOne({ symbol }).lean();

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

  res.json({
      data: stock,
  });
  } catch (error) {
    next(error);
  }
});

router.get('/:symbol/chart', (_req, res) => {
  res.json({ data: [] });
});

router.get('/:symbol/fundamentals', (_req, res) => {
  res.json({ data: {} });
});

router.get('/:symbol/news', (_req, res) => {
  res.json({ data: [] });
});

export default router;
