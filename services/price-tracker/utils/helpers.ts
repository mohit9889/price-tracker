export const parsePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  // Remove currency symbols, commas, and anything that isn't a digit or decimal point
  const numericString = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(numericString) || 0;
};
