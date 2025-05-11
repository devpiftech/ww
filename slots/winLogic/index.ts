
import { SlotSymbol, SlotMachineState } from '@/types/slots';
import { toast } from 'sonner';
import { SlotMachineConfig } from '@/types/admin';
import { calculateRowWin } from './payoutCalculator';
import { processBonusFeatures } from './bonusFeatures';

/**
 * Check for winning combinations and calculate payouts
 */
export const checkWin = (
  results: SlotSymbol[][],
  state: SlotMachineState,
  setState: React.Dispatch<React.SetStateAction<SlotMachineState>>,
  rows: number,
  reels: number,
  symbols: SlotSymbol[],
  onWin?: (amount: number) => void,
  slotConfig?: SlotMachineConfig
) => {
  let totalWin = 0;
  
  // Log the configuration being used for debugging
  console.log("Win check using slot config:", slotConfig);
  
  if (slotConfig) {
    console.log("Applied slot config RTP:", slotConfig.rtp);
    console.log("Applied payouts:", slotConfig.payouts);
  } else {
    console.log("No slot config provided to win logic!");
  }
  
  // For single row machines, apply configured payouts
  if (rows === 1) {
    const rowSymbols = results.map(reel => reel[0]);
    totalWin = calculateRowWin(rowSymbols, state.betAmount, reels, slotConfig);
  } else {
    // Check each row
    for (let row = 0; row < rows; row++) {
      const rowSymbols = results.map(reel => reel[row]);
      totalWin += calculateRowWin(rowSymbols, state.betAmount, reels, slotConfig);
    }
    
    // Check diagonals for multi-row machines
    if (rows > 1) {
      const diagonalSymbols1: SlotSymbol[] = [];
      const diagonalSymbols2: SlotSymbol[] = [];
      
      for (let i = 0; i < Math.min(reels, rows); i++) {
        if (results[i] && results[i][i]) {
          diagonalSymbols1.push(results[i][i]);
        }
        if (results[i] && results[i][rows - i - 1]) {
          diagonalSymbols2.push(results[i][rows - i - 1]);
        }
      }
      
      totalWin += calculateRowWin(diagonalSymbols1, state.betAmount, reels, slotConfig);
      totalWin += calculateRowWin(diagonalSymbols2, state.betAmount, reels, slotConfig);
    }
  }
  
  // Apply multiplier if active
  totalWin = Math.round(totalWin * state.multiplier);
  
  // Check for scatter symbols (across all reels and rows)
  let scatterCount = 0;
  let bonusCount = 0;
  
  results.forEach(reel => {
    reel.forEach(symbol => {
      if (symbol && symbol.isScatter) scatterCount++;
      if (symbol && symbol.isBonus) bonusCount++;
    });
  });
  
  // Process bonus features
  const bonusResult = processBonusFeatures(
    scatterCount,
    bonusCount,
    state,
    slotConfig
  );
  
  // Add bonus prize to total win
  totalWin += bonusResult.bonusPrize;
  
  // Update state with all changes in one atomic operation
  setState(prevState => ({
    ...prevState,
    coins: prevState.coins + (totalWin > 0 ? totalWin : 0),
    lastWin: totalWin,
    freeSpins: bonusResult.newFreeSpins,
    multiplier: bonusResult.newFreeSpins > 0 ? bonusResult.newMultiplier : 1,
    bonusActive: bonusResult.newFreeSpins > 0 ? bonusResult.bonusActive : false
  }));
  
  // Show win notifications and call onWin callback
  if (totalWin > 0) {
    if (totalWin > state.betAmount * 5) {
      toast.success(`BIG WIN: ${totalWin} coins!`, {
        description: `Congratulations on your big win!`,
        duration: 5000
      });
    } else {
      toast.success(`You won ${totalWin} coins!`);
    }
    
    if (onWin) onWin(totalWin);
  }
};

// Export all the submodules
export * from './types';
export * from './patternDetection';
export * from './rtpAdjustment';
export * from './payoutCalculator';
export * from './bonusFeatures';
