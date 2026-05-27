import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth.js';
import { Order } from '../models/Order.js';

const router = Router();

const placeOrderSchema = z.object({
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

router.post('/place', requireAuth, async (req, res, next) => {
  try {
    const input = placeOrderSchema.parse(req.body);
    const order = await Order.create({
      ...input,
      userId: new Types.ObjectId((req as AuthenticatedRequest).userId),
    });
    res.status(201).json({ data: order });
  } catch (error) {
    next(error);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      data: await Order.find({ userId: new Types.ObjectId((req as AuthenticatedRequest).userId) })
        .sort({ createdAt: -1 })
        .limit(50),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/today', requireAuth, async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    res.json({
      data: await Order.find({
        userId: new Types.ObjectId((req as AuthenticatedRequest).userId),
        createdAt: { $gte: start },
      }).sort({ createdAt: -1 }),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:orderId', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: new Types.ObjectId((req as AuthenticatedRequest).userId),
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ data: order });
  } catch (error) {
    next(error);
  }
});

router.delete('/:orderId', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.orderId,
        userId: new Types.ObjectId((req as AuthenticatedRequest).userId),
      },
      { status: 'CANCELLED' },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ data: order });
  } catch (error) {
    next(error);
  }
});

export default router;
