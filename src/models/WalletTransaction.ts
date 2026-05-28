import { Schema, Types, model } from 'mongoose';

const walletTransactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'PROCESSING', 'FAILED'],
      default: 'SUCCESS',
      index: true,
    },
    provider: {
      type: String,
      enum: ['PAPER_WALLET', 'RAZORPAY'],
      default: 'PAPER_WALLET',
    },
    referenceId: { type: String, required: true, unique: true },
    description: String,
  },
  { timestamps: true },
);

export const WalletTransaction = model('WalletTransaction', walletTransactionSchema);
