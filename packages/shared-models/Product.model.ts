import mongoose, { Schema, Document } from 'mongoose';
import { Product as IProduct } from '@price-tracker/shared-types';
import { productUrlSchema } from './ProductUrl.model';

export interface ProductDocument
  extends Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>,
    Document {
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    urls: { type: [productUrlSchema], required: true },
  },
  { timestamps: true },
);

// Map _id → id and strip __v in all JSON serialisation
productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    r.id = (ret._id as { toString(): string }).toString();
    r._id = undefined;
  },
});

/**
 * Shared Mongoose model for the `products` collection.
 * Use `mongoose.models.Product || mongoose.model(...)` pattern to prevent
 * "Cannot overwrite model" errors when modules are hot-reloaded.
 */
export const Product =
  (mongoose.models.Product as mongoose.Model<ProductDocument>) ??
  mongoose.model<ProductDocument>('Product', productSchema);
