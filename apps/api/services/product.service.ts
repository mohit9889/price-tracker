import { productRepository } from '../repositories/product.repository';
import { priceRepository } from '../repositories/price.repository';
import { Store } from '@price-tracker/shared-types';
import { z } from 'zod';

/** Zod schema for creating a product — single source of truth shared with the controller. */
export const createProductSchema = z.object({
  name: z.string().min(1),
  image: z.string().url(),
  urls: z.array(z.object({
    store: z.nativeEnum(Store),
    url: z.string().url()
  })).min(1)
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = Partial<CreateProductInput>;

export class ProductService {
  /** Create a new tracked product. */
  async createProduct(data: CreateProductInput) {
    return productRepository.create(data);
  }

  /** Partially update an existing product by ID. */
  async updateProduct(id: string, data: UpdateProductInput) {
    return productRepository.update(id, data);
  }

  /**
   * Return all products with their latest prices per store.
   * Uses a single batch aggregation instead of one query per product.
   */
  async getProducts() {
    const products = await productRepository.find();
    if (products.length === 0) return [];

    const ids = products.map((p) => p.id as string);
    const pricesByProductId = await priceRepository.getLatestPricesBatch(ids);

    return products.map((p) => ({
      ...p.toJSON(),
      latestPrices: pricesByProductId[p.id] ?? [],
    }));
  }

  /** Return a single product with its latest prices per store. */
  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) return null;

    const latestPrices = await priceRepository.getLatestPrices(id);
    return {
      ...product.toJSON(),
      latestPrices,
    };
  }

  /** Delete a product by ID. */
  async deleteProduct(id: string) {
    return productRepository.delete(id);
  }
}

export const productService = new ProductService();
