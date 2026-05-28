import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middlewares/auth.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { formatInr } from '../utils/format.js';

const router = Router();

const addFundsSchema = z.object({
  amount: z.number().min(100).max(10000000),
});

async function getWalletSummary(userId: Types.ObjectId) {
  const transactions = await WalletTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const balance = transactions.reduce((total, transaction) => {
    if (transaction.status !== 'SUCCESS') {
      return total;
    }

    return transaction.type === 'CREDIT'
      ? total + transaction.amount
      : total - transaction.amount;
  }, 0);

  return {
    balance,
    formattedBalance: formatInr(balance),
    transactions: transactions.map(transaction => ({
      _id: String(transaction._id),
      amount: formatInr(transaction.amount),
      rawAmount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      provider: transaction.provider,
      referenceId: transaction.referenceId,
      description: transaction.description ?? 'Wallet transaction',
      createdAt: transaction.createdAt,
    })),
  };
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = new Types.ObjectId((req as AuthenticatedRequest).userId);
    const wallet = await getWalletSummary(userId);
    res.json({ data: wallet });
  } catch (error) {
    next(error);
  }
});

router.post('/add-funds', requireAuth, async (req, res, next) => {
  try {
    const input = addFundsSchema.parse(req.body);
    const userId = new Types.ObjectId((req as AuthenticatedRequest).userId);

    const transaction = await WalletTransaction.create({
      userId,
      amount: input.amount,
      type: 'CREDIT',
      status: 'SUCCESS',
      provider: 'PAPER_WALLET',
      referenceId: `PW-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      description: 'Paper wallet funds added',
    });

    const wallet = await getWalletSummary(userId);
    res.status(201).json({
      data: {
        wallet,
        transaction: {
          _id: String(transaction._id),
          amount: formatInr(transaction.amount),
          type: transaction.type,
          status: transaction.status,
          provider: transaction.provider,
          referenceId: transaction.referenceId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
