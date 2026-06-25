import { ExtractedProductData } from '.';

/** Find the entry with the lowest price. Returns null for an empty array. */
export const findLowestPrice = (prices: ExtractedProductData[]): ExtractedProductData | null => {
  if (!prices || prices.length === 0) return null;
  return prices.reduce((min, p) => (p.price < min.price ? p : min), prices[0]);
};

/** Find the entry with the highest price. Returns null for an empty array. */
export const findHighestPrice = (prices: ExtractedProductData[]): ExtractedProductData | null => {
  if (!prices || prices.length === 0) return null;
  return prices.reduce((max, p) => (p.price > max.price ? p : max), prices[0]);
};

/**
 * Calculate the savings between the highest and lowest price.
 * Returns 0 if there is no spread (only one price or highest <= lowest).
 */
export const calculateSavings = (highest: number, lowest: number): number => {
  if (!highest || !lowest || highest <= lowest) return 0;
  return highest - lowest;
};
