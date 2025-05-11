
import { useState, useEffect } from 'react';
import { SlotSymbol, SlotMachineState } from '@/types/slots';
import { SlotMachineConfig } from '@/types/admin';
import { generateReelData } from '../slotReelUtils';

export const useStateManager = (
  initialCoins: number,
  symbols: SlotSymbol[],
  reels: number,
  rows: number,
  minBet: number,
  onSaveBalance?: (balance: number) => void,
) => {
  // Create initial state
  const [state, setState] = useState<SlotMachineState>({
    coins: initialCoins,
    betAmount: minBet,
    spinning: false,
    results: Array(reels).fill(Array(rows).fill(symbols[0])),
    lastWin: 0,
    bonusActive: false,
    freeSpins: 0,
    multiplier: 1
  });

  // Generate initial reel data
  const [reelData, setReelData] = useState<SlotSymbol[][]>(() =>
    generateReelData(symbols, reels)
  );

  // Save balance when it changes
  useEffect(() => {
    if (onSaveBalance && !state.spinning) {
      onSaveBalance(state.coins);
    }
  }, [state.coins, state.spinning, onSaveBalance]);

  return { state, setState, reelData, setReelData };
};
