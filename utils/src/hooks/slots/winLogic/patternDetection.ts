
import { SlotSymbol } from '@/types/slots';

/**
 * Analyze symbols to detect winning patterns
 */
export const getSymbolPattern = (symbols: SlotSymbol[]): string => {
  // Count how many of each symbol
  const counts: Record<string, number> = {};
  let hasWild = false;
  
  symbols.forEach(symbol => {
    if (symbol.isWild) hasWild = true;
    counts[symbol.id] = (counts[symbol.id] || 0) + 1;
  });
  
  // Find the symbol with the most matches
  let highestCount = 0;
  let highestSymbol = '';
  
  Object.entries(counts).forEach(([id, count]) => {
    if (count > highestCount) {
      highestCount = count;
      highestSymbol = id;
    }
  });
  
  // If we have 3 of the same symbol
  if (highestCount === 3) return `three_${highestSymbol}`;
  // If we have 2 of the same symbol
  if (highestCount === 2) return `two_${highestSymbol}`;
  
  return '';
};
