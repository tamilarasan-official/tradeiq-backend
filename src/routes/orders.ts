import { Router } from 'express';
import { z } from 'zod';
import { Order } from '../models/Order.js';

const router = Router();

const placeOrderSchema = z.object({
  userId: z.string(),
  symbol: z.string(),
  exchange: z.enum(['NSE', 'BSE']),
  orderType: z.enum(['MARKET', 'LIMIT', 'SL', 'SL-M']),
  transactionType: z.enum(['BUY', 'SELL']),
  product: z.enum(['CNC', 'MIS']),
  quantity: z.number().int().positive(),
  price: z.number().optional(),
  triggerPrice: z.number().optional().nullable(),
  decisionToConfirmMs: z.number().optional(),
  sessionId: z.string().optional(),
});

router.post('/place', async (req, res, next) => {
  try {
    const input = placeOrderSchema.parse(req.body);
    const order = await Order.create(input);
    res.status(201).json({ data: order });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    res.json({ data: await Order.find().sort({ createdAt: -1 }).limit(50) });
  } catch (error) {
    next(error);
  }
});

router.get('/today', async (_req, res) => res.json({ data: [] }));
router.get('/:orderId', async (req, res) => res.json({ data: { id: req.params.orderId } }));
router.delete('/:orderId', async (req, res) => res.json({ cancelled: req.params.orderId }));

export default router;
