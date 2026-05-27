import { Schema, model, Types } from 'mongoose';

const watchlistItemSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    exchange: { type: String, enum: ['NSE', 'BSE'], required: true },
  },
  { timestamps: true },
);

watchlistItemSchema.index({ userId: 1, symbol: 1, exchange: 1 }, { unique: true });

export const WatchlistItem = model('WatchlistItem', watchlistItemSchema);
