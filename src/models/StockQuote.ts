import { Schema, model } from 'mongoose';

const stockQuoteSchema = new Schema(
  {
    symbol: { type: String, required: true, uppercase: true, trim: true, unique: true, index: true },
    companyName: { type: String, required: true, trim: true },
    exchange: { type: String, enum: ['NSE', 'BSE'], required: true },
    ltp: { type: Number, required: true, default: 0 },
    changePercent: { type: Number, required: true, default: 0 },
    previousClose: { type: Number, default: 0 },
    source: { type: String, default: 'MANUAL' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const StockQuote = model('StockQuote', stockQuoteSchema);
