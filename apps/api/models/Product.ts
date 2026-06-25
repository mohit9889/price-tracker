import mongoose, { Schema, Document } from 'mongoose';
import { Product as IProduct } from '@price-tracker/shared-types';
import { productUrlSchema } from './ProductUrl';

export interface ProductDocument extends Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  urls: { type: [productUrlSchema], required: true },
}, { timestamps: true });

// Ensure JSON output maps _id to id
productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Product = mongoose.model<ProductDocument>('Product', productSchema);
