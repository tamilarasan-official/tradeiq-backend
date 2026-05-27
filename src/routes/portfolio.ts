import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth.js';
import { Holding } from '../models/Holding.js';
import { StockQuote } from '../models/StockQuote.js';
import { formatPercent } from '../utils/format.js';

const router = Router();

router.get('/holdings', requireAuth, async (req, res, next) => {
  try {
    res.json({
      data: await Holding.find({ userId: new Types.ObjectId((req as AuthenticatedRequest).userId) })
        .sort({ createdAt: -1 })
        .limit(100),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/positions', requireAuth, async (req, res, next) => {
  try {
    res.json({
      data: await Holding.find({ userId: new Types.ObjectId((req as AuthenticatedRequest).userId) }),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/pnl', requireAuth, async (req, res, next) => {
  try {
    const holdings = await Holding.find({
      userId: new Types.ObjectId((req as AuthenticatedRequest).userId),
    }).lean();
    const quotes = await StockQuote.find({
      symbol: { $in: holdings.map(holding => holding.symbol) },
    }).lean();
    const quoteBySymbol = new Map(quotes.map(quote => [quote.symbol, quote]));
    const unrealised = holdings.reduce((total, holding) => {
      const ltp = quoteBySymbol.get(holding.symbol)?.ltp ?? holding.averageCost;
      return total + (ltp - holding.averageCost) * holding.quantity;
    }, 0);

    res.json({ data: { realised: 0, unrealised, dayPnl: unrealised } });
  } catch (error) {
    next(error);
  }
});

router.get('/performance', requireAuth, async (req, res, next) => {
  try {
    const holdings = await Holding.find({
      userId: new Types.ObjectId((req as AuthenticatedRequest).userId),
    }).lean();
    res.json({
      data: {
        holdingsCount: holdings.length,
        alpha: 0,
        beta: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/diversification', requireAuth, async (req, res, next) => {
  try {
    const holdings = await Holding.find({
      userId: new Types.ObjectId((req as AuthenticatedRequest).userId),
    }).lean();
    const sectorMap = new Map<string, number>();
    holdings.forEach(holding => {
      const sector = holding.sector ?? 'Unclassified';
      sectorMap.set(sector, (sectorMap.get(sector) ?? 0) + holding.quantity * holding.averageCost);
    });
    const total = [...sectorMap.values()].reduce((sum, value) => sum + value, 0);
    const sectors = [...sectorMap.entries()].map(([sector, value]) => ({
      sector,
      value,
      weight: total > 0 ? formatPercent((value / total) * 100) : '0.00%',
    }));

    res.json({ data: { hhi: 0, sectors } });
  } catch (error) {
    next(error);
  }
});

export default router;
