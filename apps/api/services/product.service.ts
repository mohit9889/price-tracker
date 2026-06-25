import { productRepository } from '../repositories/product.repository';
import { priceRepository } from '../repositories/price.repository';

export class ProductService {
  async createProduct(data: any) {
    return productRepository.create(data);
  }

  async updateProduct(id: string, data: any) {
    return productRepository.update(id, data);
  }

  async getProducts() {
    const products = await productRepository.find();
    
    // For each product, fetch latest prices to return rich data
    const productsWithPrices = await Promise.all(products.map(async (p) => {
      const latestPrices = await priceRepository.getLatestPrices(p.id);
      return {
        ...p.toJSON(),
        latestPrices
      };
    }));
    
    return productsWithPrices;
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) return null;
    
    const latestPrices = await priceRepository.getLatestPrices(id);
    return {
      ...product.toJSON(),
      latestPrices
    };
  }

  async deleteProduct(id: string) {
    return productRepository.delete(id);
  }
}

export const productService = new ProductService();
