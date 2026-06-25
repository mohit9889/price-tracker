import { Request, Response, NextFunction } from 'express';
import { productService, createProductSchema, UpdateProductInput } from '../services/product.service';
import { z } from 'zod';

export class ProductsController {
  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await productService.getProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  };

  getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await productService.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
      }
      next(error);
    }
  };

  /** PATCH — partial update; only supplied fields are changed. */
  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: UpdateProductInput = createProductSchema.partial().parse(req.body);
      const product = await productService.updateProduct(req.params.id, data);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
      }
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.deleteProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const productsController = new ProductsController();
