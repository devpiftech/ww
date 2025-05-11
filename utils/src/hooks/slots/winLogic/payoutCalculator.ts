
import { SlotSymbol } from '@/types/slots';
import { SlotMachineConfig } from '@/types/admin';
import { PatternInfo } from './types';
import { getSymbolPattern } from './patternDetection';
import { calculateSingleRowWin } from '../slotCalculations';
import { getRtpAdjustedWinAmount } from './rtpAdjustment';

/**
 * Get payout multiplier from configuration
 */
export const getConfiguredPayout = (
  pattern: string,
  slotConfig?: SlotMachineConfig
): number => {
  if (!slotConfig || !slotConfig.payouts) {
    console.log(`No config or payouts found for pattern: ${pattern}`);
    return 0;
  }
  
  const configPayouts = slotConfig.payouts;
  const payout = configPayouts[pattern];
  
  if (payout === undefined) {
    console.log(`No payout defined for pattern: ${pattern}`);
    return 0;
  }
  
  // Ensure we always return a number
  const payoutValue = typeof payout === 'string' ? parseFloat(payout) : Number(payout);
  console.log(`Pattern ${pattern} has payout: ${payoutValue}`);
  return payoutValue;
};

/**
 * Calculate win amount for a row of symbols
 */
export const calculateRowWin = (
  rowSymbols: SlotSymbol[], 
  betAmount: number, 
  reels: number, 
  slotConfig?: SlotMachineConfig
): number => {
  const pattern = getSymbolPattern(rowSymbols);
  
  if (pattern) {
    console.log(`Pattern detected: ${pattern}`);
    const payoutMultiplier = getConfiguredPayout(pattern, slotConfig);
    
    if (payoutMultiplier > 0) {
      console.log(`Using configured payout: ${payoutMultiplier} for pattern: ${pattern}`);
      const winAmount = betAmount * payoutMultiplier;
      return getRtpAdjustedWinAmount(winAmount, slotConfig);
    }
  }
  
  // Fallback to default win calculation
  console.log("No pattern or payout found, using default calculation");
  const { winAmount } = calculateSingleRowWin(rowSymbols, betAmount, reels);
  return getRtpAdjustedWinAmount(winAmount, slotConfig);
};

/**
 * Get pattern info for a row of symbols
 */
export const getPatternInfo = (
  rowSymbols: SlotSymbol[],
  slotConfig?: SlotMachineConfig
): PatternInfo | null => {
  const pattern = getSymbolPattern(rowSymbols);
  
  if (pattern) {
    const payoutMultiplier = getConfiguredPayout(pattern, slotConfig);
    if (payoutMultiplier > 0) {
      return { pattern, payoutMultiplier };
    }
  }
  
  return null;
};
