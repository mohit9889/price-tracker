import mongoose, { Schema, Document } from 'mongoose';
import { PriceHistory as IPriceHistory, Store } from '@price-tracker/shared-types';

export interface PriceHistoryDocument
  extends Omit<IPriceHistory, 'id' | 'timestamp'>,
    Document {
  /** Stored as a native Date in MongoDB for reliable range queries and sorting. */
  timestamp: Date;
}

const priceHistorySchema = new Schema<PriceHistoryDocument>({
  productId: { type: String, required: true, ref: 'Product' },
  store: { type: String, enum: Object.values(Store), required: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, required: true },
});

priceHistorySchema.index({ productId: 1, timestamp: -1 });

priceHistorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete (ret as { _id?: unknown })._id;
  },
});

/**
 * Shared Mongoose model for the `pricehistories` collection.
 * Single source of truth — imported by both apps/api and services/price-tracker.
 */
export const PriceHistory =
  (mongoose.models.PriceHistory as mongoose.Model<PriceHistoryDocument>) ??
  mongoose.model<PriceHistoryDocument>('PriceHistory', priceHistorySchema);
