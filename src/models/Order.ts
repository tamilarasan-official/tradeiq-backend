import { Schema, model, Types } from 'mongoose';

const orderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    exchange: { type: String, enum: ['NSE', 'BSE'], required: true },
    orderType: {
      type: String,
      enum: ['MARKET', 'LIMIT', 'SL', 'SL-M'],
      required: true,
    },
    transactionType: { type: String, enum: ['BUY', 'SELL'], required: true },
    product: { type: String, enum: ['CNC', 'MIS'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: Number,
    triggerPrice: Number,
    status: {
      type: String,
      enum: ['PENDING', 'OPEN', 'COMPLETE', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
    },
    filledQuantity: { type: Number, default: 0 },
    averagePrice: Number,
    brokerOrderId: String,
    placedAt: { type: Date, default: Date.now },
    decisionToConfirmMs: Number,
    sessionId: String,
  },
  { timestamps: true },
);

export const Order = model('Order', orderSchema);
