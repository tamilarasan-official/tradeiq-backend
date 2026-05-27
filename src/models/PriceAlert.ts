import { Schema, model, Types } from 'mongoose';

const priceAlertSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true },
    condition: {
      type: String,
      enum: ['ABOVE', 'BELOW', 'PERCENT_CHANGE'],
      required: true,
    },
    targetPrice: { type: Number, required: true },
    isTriggered: { type: Boolean, default: false },
    triggeredAt: Date,
  },
  { timestamps: true },
);

export const PriceAlert = model('PriceAlert', priceAlertSchema);
