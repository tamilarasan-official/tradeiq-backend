import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { env } from '../config/env.js';
import { Holding } from '../models/Holding.js';
import { MarketIndex } from '../models/MarketIndex.js';
import { StockQuote } from '../models/StockQuote.js';
import { WatchlistItem } from '../models/WatchlistItem.js';

const router = Router();

function requireAdminApiKey(req: Request, res: Response, next: NextFunction) {
  if (!env.ADMIN_API_KEY) {
    return res.status(503).json({ message: 'ADMIN_API_KEY is not configured' });
  }

  if (req.header('x-admin-api-key') !== env.ADMIN_API_KEY) {
    return res.status(401).json({ message: 'Invalid admin API key' });
  }

  return next();
}

const stockQuoteSchema = z.object({
  symbol: z.string().min(1),
  companyName: z.string().min(1),
  exchange: z.enum(['NSE', 'BSE']),
  ltp: z.number().nonnegative(),
  changePercent: z.number(),
  previousClose: z.number().optional(),
  source: z.string().optional(),
});

const marketIndexSchema = z.object({
  symbol: z.string().min(1),
  ltp: z.number().nonnegative(),
  changePercent: z.number(),
  source: z.string().optional(),
});

const holdingSchema = z.object({
  userId: z.string(),
  symbol: z.string().min(1),
  exchange: z.enum(['NSE', 'BSE']),
  quantity: z.number().positive(),
  averageCost: z.number().nonnegative(),
  sector: z.string().optional(),
  marketCap: z.enum(['LARGE', 'MID', 'SMALL']).optional(),
});

const watchlistSchema = z.object({
  userId: z.string(),
  symbol: z.string().min(1),
  exchange: z.enum(['NSE', 'BSE']),
});

router.get('/research/export', (_req, res) => {
  res.type('text/csv').send(
    'userId_hash,studyGroup,week,avgExecutionTimeMs,tradesCount,portfolioReturnPct,benchmarkReturnPct,alpha,sharpeRatio,hhi,susScore,platformOS,appVersion\n',
  );
});

router.post('/import/stocks', requireAdminApiKey, async (req, res, next) => {
  try {
    const items = z.array(stockQuoteSchema).parse(req.body.items ?? req.body);
    const result = await StockQuote.bulkWrite(
      items.map(item => ({
        updateOne: {
          filter: { symbol: item.symbol.toUpperCase() },
          update: {
            $set: {
              ...item,
              symbol: item.symbol.toUpperCase(),
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      })),
    );
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/import/indices', requireAdminApiKey, async (req, res, next) => {
  try {
    const items = z.array(marketIndexSchema).parse(req.body.items ?? req.body);
    const result = await MarketIndex.bulkWrite(
      items.map(item => ({
        updateOne: {
          filter: { symbol: item.symbol.toUpperCase() },
          update: {
            $set: {
              ...item,
              symbol: item.symbol.toUpperCase(),
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      })),
    );
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/import/holdings', requireAdminApiKey, async (req, res, next) => {
  try {
    const items = z.array(holdingSchema).parse(req.body.items ?? req.body);
    const result = await Holding.insertMany(items, { ordered: false });
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/import/watchlist', requireAdminApiKey, async (req, res, next) => {
  try {
    const items = z.array(watchlistSchema).parse(req.body.items ?? req.body);
    const result = await WatchlistItem.bulkWrite(
      items.map(item => {
        const userId = new Types.ObjectId(item.userId);
        return {
          updateOne: {
            filter: {
              userId,
              symbol: item.symbol.toUpperCase(),
              exchange: item.exchange,
            },
            update: {
              $set: {
                userId,
                symbol: item.symbol.toUpperCase(),
                exchange: item.exchange,
              },
            },
            upsert: true,
          },
        };
      }),
    );
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
