import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth.js';
import { Holding } from '../models/Holding.js';
import { Order } from '../models/Order.js';
import { StockQuote } from '../models/StockQuote.js';
import { WatchlistItem } from '../models/WatchlistItem.js';
import { formatInr, formatPercent, formatSignedInr } from '../utils/format.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = new Types.ObjectId((req as AuthenticatedRequest).userId);
    const [holdings, orders, watchlistItems] = await Promise.all([
      Holding.find({ userId }).sort({ createdAt: -1 }).lean(),
      Order.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
      WatchlistItem.find({ userId }).sort({ createdAt: -1 }).lean(),
    ]);

    const symbols = [
      ...new Set([
        ...holdings.map(holding => holding.symbol),
        ...watchlistItems.map(item => item.symbol),
      ]),
    ];
    const quotes = await StockQuote.find({ symbol: { $in: symbols } }).lean();
    const quoteBySymbol = new Map(quotes.map(quote => [quote.symbol, quote]));
    const invested = holdings.reduce(
      (total, holding) => total + holding.quantity * holding.averageCost,
      0,
    );
    const current = holdings.reduce((total, holding) => {
      const quote = quoteBySymbol.get(holding.symbol);
      return total + holding.quantity * (quote?.ltp ?? holding.averageCost);
    }, 0);
    const dayPnl = current - invested;

    const watchlist = watchlistItems.map(item => {
      const quote = quoteBySymbol.get(item.symbol);
      return {
        symbol: item.symbol,
        exchange: item.exchange,
        price: quote ? quote.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00',
        change: quote ? formatPercent(quote.changePercent) : '0.00%',
      };
    });

    const holdingsData = holdings.map(holding => {
      const quote = quoteBySymbol.get(holding.symbol);
      const pnlPercent = quote
        ? ((quote.ltp - holding.averageCost) / holding.averageCost) * 100
        : 0;
      return {
        symbol: holding.symbol,
        quantity: `${holding.quantity} qty`,
        pnl: formatPercent(pnlPercent),
      };
    });

    const ordersData = orders.map(order => ({
      symbol: order.symbol,
      detail: `${order.transactionType} x ${order.quantity}`,
      status: order.status,
    }));

  res.json({
    data: {
      summary: {
        title: 'Home',
          primaryMetric: formatSignedInr(dayPnl),
          invested: formatInr(invested),
          current: formatInr(current),
      },
        watchlist,
        holdings: holdingsData,
        orders: ordersData,
    },
  });
  } catch (error) {
    next(error);
  }
});

export default router;
