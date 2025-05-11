
import { SlotMachineState } from '@/types/slots';
import { SlotMachineConfig } from '@/types/admin';
import { toast } from 'sonner';
import { BonusFeatureResult } from './types';

/**
 * Process scatter and bonus features
 */
export const processBonusFeatures = (
  scatterCount: number,
  bonusCount: number,
  state: SlotMachineState,
  slotConfig?: SlotMachineConfig
): BonusFeatureResult => {
  // Default result
  const result: BonusFeatureResult = {
    newFreeSpins: state.freeSpins,
    newMultiplier: state.multiplier,
    bonusActive: state.bonusActive,
    bonusPrize: 0
  };
  
  // Use configured bonus features if available
  const useConfiguredBonus = slotConfig && slotConfig.special_features;
  
  // Handle scatter wins (typically free spins)
  // Apply configured free spins if available
  if (useConfiguredBonus && slotConfig.special_features.includes('free_spins')) {
    const freeSpinsFrequency = slotConfig.bonus_frequency || 5;  
    const randomValue = Math.random() * 100;
    
    // Trigger free spins based on configured frequency
    if (scatterCount >= 3 || (randomValue <= freeSpinsFrequency)) {
      const freeSpinsAwarded = (scatterCount >= 3) ? scatterCount * 2 : 
                              Math.floor(Math.random() * 6) + 5; // 5-10 free spins
                              
      result.newFreeSpins += freeSpinsAwarded;
      
      // Apply multiplier if configured
      if (slotConfig.special_features.includes('multipliers')) {
        result.newMultiplier = Math.max(state.multiplier, 2); // Keep the higher multiplier
      }
      
      toast.success(`Free Spins Bonus!`, {
        description: `You won ${freeSpinsAwarded} free spins with ${result.newMultiplier}x multiplier!`,
        duration: 5000
      });
    }
  } else if (scatterCount >= 3) {
    // Fallback to default free spins logic
    const freeSpinsAwarded = scatterCount * 2;
    result.newFreeSpins += freeSpinsAwarded;
    result.newMultiplier = Math.max(state.multiplier, 2); // Keep the higher multiplier
    
    toast.success(`Free Spins Bonus!`, {
      description: `You won ${freeSpinsAwarded} free spins with 2x multiplier!`,
      duration: 5000
    });
  }
  
  // Handle bonus feature
  if (useConfiguredBonus && slotConfig.special_features.includes('bonus_game')) {
    const bonusFrequency = slotConfig.bonus_frequency || 5;
    const randomValue = Math.random() * 100;
    
    // Trigger bonus based on configured frequency
    if (bonusCount >= 3 || (randomValue <= bonusFrequency)) {
      result.bonusActive = true;
      
      // Apply configured bonus payout
      const bonusPayoutMultiplier = slotConfig.payouts?.bonus_game || 10;
      // Convert to number if it's a string
      const numericMultiplier = typeof bonusPayoutMultiplier === 'string' ? 
                              parseFloat(bonusPayoutMultiplier) : Number(bonusPayoutMultiplier);
      
      result.bonusPrize = state.betAmount * numericMultiplier;
      
      toast.success(`Bonus Feature Triggered!`, {
        description: `You won ${result.bonusPrize} coins from the bonus!`,
        duration: 5000
      });
    }
  } else if (bonusCount >= 3) {
    // Fallback to default bonus logic
    result.bonusActive = true;
    
    result.bonusPrize = state.betAmount * 10;
    
    toast.success(`Bonus Feature Triggered!`, {
      description: `You won ${result.bonusPrize} coins from the bonus!`,
      duration: 5000
    });
  }
  
  return result;
};
