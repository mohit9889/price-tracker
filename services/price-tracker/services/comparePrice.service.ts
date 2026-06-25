export const findLowestPrice = (prices: any[]) => {
  if (!prices || prices.length === 0) return null;
  return prices.reduce((min, p) => p.price < min.price ? p : min, prices[0]);
};

export const findHighestPrice = (prices: any[]) => {
  if (!prices || prices.length === 0) return null;
  return prices.reduce((max, p) => p.price > max.price ? p : max, prices[0]);
};

export const calculateSavings = (highest: number, lowest: number) => {
  if (!highest || !lowest || highest <= lowest) return 0;
  return highest - lowest;
};
