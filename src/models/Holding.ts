import { Schema, model, Types } from 'mongoose';

const holdingSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true },
    exchange: { type: String, enum: ['NSE', 'BSE'], required: true },
    quantity: { type: Number, required: true },
    averageCost: { type: Number, required: true },
    buyDate: Date,
    sector: String,
    marketCap: { type: String, enum: ['LARGE', 'MID', 'SMALL'] },
  },
  { timestamps: true },
);

export const Holding = model('Holding', holdingSchema);
