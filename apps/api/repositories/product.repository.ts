import { Product, ProductDocument } from '../models/Product';
import { Product as IProduct } from '@price-tracker/shared-types';

export class ProductRepository {
  async create(data: Partial<IProduct>): Promise<ProductDocument> {
    const product = new Product(data);
    return product.save();
  }

  async update(id: string, data: Partial<IProduct>): Promise<ProductDocument | null> {
    return Product.findByIdAndUpdate(id, data, { new: true });
  }

  async find(): Promise<ProductDocument[]> {
    return Product.find().sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<ProductDocument | null> {
    return Product.findById(id);
  }

  async delete(id: string): Promise<ProductDocument | null> {
    return Product.findByIdAndDelete(id);
  }
}

export const productRepository = new ProductRepository();
