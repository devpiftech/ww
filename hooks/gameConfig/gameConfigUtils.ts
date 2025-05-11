
import { GameConfig, SlotMachineConfig } from '@/types/admin';

// Get min bet
export const getMinBet = (config: GameConfig | SlotMachineConfig | null): number => {
  if (!config) return 5; // Default
  return config.min_bet;
};

// Get max bet
export const getMaxBet = (config: GameConfig | SlotMachineConfig | null): number => {
  if (!config) return 1000; // Default
  return config.max_bet;
};

// Get payout for a specific outcome
export const getPayout = (config: GameConfig | SlotMachineConfig | null, outcome: string): number => {
  if (!config || !config.payouts) return 1; // Default
  
  // Handle progressive jackpot for slot machines
  if (config.payouts[outcome] === 'progressive') {
    // For now, return a high default value
    return 10000;
  }
  
  // Return the payout or default to 1
  return typeof config.payouts[outcome] === 'number' 
    ? config.payouts[outcome] as number 
    : 1;
};

// Calculate expected win based on RTP and bet amount
export const calculateExpectedWin = (config: GameConfig | SlotMachineConfig | null, betAmount: number): number => {
  if (!config) return betAmount; // Default to same as bet
  
  // Calculate based on RTP (Return to Player)
  return betAmount * (config.rtp / 100);
};

// Apply house edge to random outcomes
export const applyHouseEdge = (config: GameConfig | SlotMachineConfig | null, randomValue: number): number => {
  if (!config) return randomValue; // Default
  
  // Simple implementation - adjust random value based on house edge
  // This is a simplified approach, real casino games use more complex algorithms
  const houseEdgeFactor = 1 - (config.house_edge / 100);
  return randomValue * houseEdgeFactor;
};
