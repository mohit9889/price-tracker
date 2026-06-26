import { Request, Response, NextFunction } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { priceService } from '../services/price.service';
import { productService } from '../services/product.service';

export class PricesController {
  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await priceService.getPriceHistory(req.params.productId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Trigger a price refresh for a single product by spawning the price-tracker
   * service as a detached child process.
   *
   * Returns 202 Accepted immediately — scraping is async and may take 30-90s
   * depending on the number of store URLs attached to the product.
   *
   * The tracker process runs independently; its stdout/stderr are piped to the
   * API process logs so failures are visible without blocking the response.
   */
  refreshPrices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;

      // Verify the product exists before spawning the heavy scraper process
      const product = await productService.getProductById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Resolve the tracker entry point relative to the monorepo root
      const trackerPath = path.resolve(__dirname, '../../../services/price-tracker/index.ts');

      const child = spawn(
        'npx',
        ['tsx', trackerPath, `--productId=${productId}`],
        {
          detached: true,   // allow the child to outlive the parent process
          stdio: 'pipe',    // capture output for logging
          env: { ...process.env },
        },
      );

      // Pipe child output to the API process so failures are visible in logs
      child.stdout?.on('data', (d: Buffer) => process.stdout.write(`[tracker] ${d}`));
      child.stderr?.on('data', (d: Buffer) => process.stderr.write(`[tracker] ${d}`));

      child.on('error', (err) =>
        console.error(`[tracker] Failed to spawn price-tracker for product ${productId}:`, err),
      );

      child.on('exit', (code) =>
        console.log(`[tracker] Price refresh for product ${productId} exited with code ${code}`),
      );

      // Unref so the API process isn't kept alive waiting for the child
      child.unref();

      return res.status(202).json({
        success: true,
        message: `Price refresh triggered for product ${productId}. Results will be available shortly.`,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const pricesController = new PricesController();

