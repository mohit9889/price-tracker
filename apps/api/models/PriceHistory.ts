import mongoose, { Schema, Document } from 'mongoose';
import { PriceHistory as IPriceHistory, Store } from '@price-tracker/shared-types';

export interface PriceHistoryDocument extends Omit<IPriceHistory, 'id'>, Document {}

const priceHistorySchema = new Schema<PriceHistoryDocument>({
  productId: { type: String, required: true, ref: 'Product' },
  store: { type: String, enum: Object.values(Store), required: true },
  price: { type: Number, required: true },
  timestamp: { type: String, required: true }, // Stored as ISO string
});

priceHistorySchema.index({ productId: 1, timestamp: -1 });

priceHistorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const PriceHistory = mongoose.model<PriceHistoryDocument>('PriceHistory', priceHistorySchema);
