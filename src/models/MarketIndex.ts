import { Schema, model } from 'mongoose';

const marketIndexSchema = new Schema(
  {
    symbol: { type: String, required: true, uppercase: true, trim: true, unique: true, index: true },
    ltp: { type: Number, required: true, default: 0 },
    changePercent: { type: Number, required: true, default: 0 },
    source: { type: String, default: 'MANUAL' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const MarketIndex = model('MarketIndex', marketIndexSchema);
