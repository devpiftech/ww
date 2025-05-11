
import { SlotSymbol } from '@/types/slots';

// Calculate win for a single row of symbols
export const calculateSingleRowWin = (
  rowSymbols: SlotSymbol[], 
  betAmount: number, 
  reels: number
): { winAmount: number; winningSymbolId: string } => {
  // Count occurrences of each symbol
  const symbolCount: Record<string, number> = {};
  const wildSymbols = rowSymbols.filter(s => s.isWild);
  const wildCount = wildSymbols.length;
  
  // Count non-wild symbols
  rowSymbols.forEach(symbol => {
    if (!symbol.isWild && !symbol.isScatter) {
      symbolCount[symbol.id] = (symbolCount[symbol.id] || 0) + 1;
    }
  });
  
  // Find highest potential win
  let highestWin = 0;
  let winningSymbolId = '';
  
  Object.entries(symbolCount).forEach(([symbolId, count]) => {
    const totalMatches = count + wildCount;
    
    if (totalMatches >= Math.ceil(reels / 2)) { // At least half the reels need to match
      const symbol = rowSymbols.find(s => s.id === symbolId);
      if (symbol) {
        const winMultiplier = totalMatches / reels; // Partial win based on match ratio
        const winAmount = symbol.value * betAmount * winMultiplier;
        
        // Award more for more matches
        const matchBonus = totalMatches >= reels ? 2 : 1;
        
        if (winAmount * matchBonus > highestWin) {
          highestWin = winAmount * matchBonus;
          winningSymbolId = symbolId;
        }
      }
    }
  });
  
  // Check for all-wild combination
  if (wildCount === reels) {
    const wildSymbol = rowSymbols.find(s => s.isWild);
    if (wildSymbol) {
      const wildWin = wildSymbol.value * betAmount * 3; // Triple prize for all wilds
      if (wildWin > highestWin) {
        highestWin = wildWin;
        winningSymbolId = wildSymbol.id;
      }
    }
  }
  
  return { winAmount: highestWin, winningSymbolId };
};
