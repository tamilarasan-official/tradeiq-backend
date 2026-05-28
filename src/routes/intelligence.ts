import { Router } from 'express';
import { Types } from 'mongoose';
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth.js';
import { Holding } from '../models/Holding.js';
import { Order } from '../models/Order.js';
import { StockQuote } from '../models/StockQuote.js';

const router = Router();

router.get('/overview', requireAuth, async (req, res, next) => {
  try {
    const userId = new Types.ObjectId((req as AuthenticatedRequest).userId);
    const [holdings, orders] = await Promise.all([
      Holding.find({ userId }).lean(),
      Order.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);
    const quotes = await StockQuote.find({
      symbol: { $in: holdings.map(holding => holding.symbol) },
    }).lean();
    const quoteBySymbol = new Map(quotes.map(quote => [quote.symbol, quote]));
    const invested = holdings.reduce(
      (total, holding) => total + holding.averageCost * holding.quantity,
      0,
    );
    const current = holdings.reduce((total, holding) => {
      const quote = quoteBySymbol.get(holding.symbol);
      return total + (quote?.ltp ?? holding.averageCost) * holding.quantity;
    }, 0);
    const sectors = new Set(holdings.map(holding => holding.sector ?? 'Unclassified'));
    const concentration =
      invested > 0
        ? Math.max(
            0,
            ...holdings.map(holding => (holding.averageCost * holding.quantity) / invested),
          )
        : 0;
    const sellOrders = orders.filter(order => order.transactionType === 'SELL').length;
    const buyOrders = orders.filter(order => order.transactionType === 'BUY').length;
    const rejectedOrders = orders.filter(order => order.status === 'REJECTED').length;
    const healthScore = Math.max(
      35,
      Math.min(
        96,
        62 +
          Math.min(sectors.size, 5) * 5 -
          Math.round(concentration * 20) +
          (current >= invested ? 8 : -8),
      ),
    );
    const riskScore = Math.min(
      100,
      Math.round(concentration * 60 + rejectedOrders * 5 + Math.max(0, sellOrders - buyOrders) * 4),
    );

    res.json({
      data: {
        portfolioHealth: {
          score: healthScore,
          label: healthScore >= 75 ? 'Strong' : healthScore >= 55 ? 'Fair' : 'Needs work',
          drivers: [
            `${sectors.size || 0} sector groups tracked`,
            `${holdings.length} active holdings`,
            current >= invested ? 'Portfolio value is above cost' : 'Portfolio value is below cost',
          ],
        },
        aiRecommendation: {
          title: holdings.length ? 'Rebalance gradually' : 'Build a starter watchlist',
          suggestions: holdings.length
            ? [
                'Reduce concentration in the largest holding if it exceeds 35%',
                'Add sector balance before increasing position size',
                'Review loss-making positions before averaging down',
              ]
            : [
                'Add 5-8 large-cap stocks to watchlist',
                'Start with paper trades before live orders',
                'Track sectors before building holdings',
              ],
        },
        risk: {
          score: riskScore,
          level: riskScore >= 70 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low',
          factors: [
            'Portfolio concentration',
            'Recent rejected orders',
            'Sell pressure versus buy activity',
          ],
        },
        predictiveAlerts: [
          {
            title: 'Volatility watch',
            message: 'Alert when a watched stock moves more than 2.5% intraday.',
            severity: 'Medium',
          },
          {
            title: 'Breakout scan',
            message: 'Track sudden price and volume changes when live feed is connected.',
            severity: 'Low',
          },
        ],
        emotionalTrading: {
          status: sellOrders > buyOrders || rejectedOrders > 1 ? 'Watch' : 'Stable',
          signals: [
            `${orders.length} recent orders analysed`,
            `${sellOrders} sell orders`,
            `${rejectedOrders} rejected orders`,
          ],
          coaching:
            sellOrders > buyOrders
              ? 'Review sell decisions against your plan before confirming.'
              : 'Trading behaviour currently looks controlled.',
        },
        paperTrading: {
          balance: 1000000,
          enabled: true,
          message: 'Practice buy/sell decisions with virtual money before using real capital.',
        },
        aiAssistant: {
          prompts: [
            'Explain my portfolio risk',
            'What should I check before buying?',
            'Summarise today market movement',
          ],
        },
        voiceAssistant: {
          examples: ['Buy 5 shares of TCS', 'Show today gainers', 'Open my holdings'],
          safety: 'Voice orders always require preview and confirmation.',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
