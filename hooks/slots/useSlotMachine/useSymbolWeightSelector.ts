
import { useCallback } from 'react';
import { SlotSymbol } from '@/types/slots';
import { SlotMachineConfig } from '@/types/admin';

export const useSymbolWeightSelector = (
  symbols: SlotSymbol[],
  slotConfig?: SlotMachineConfig
) => {
  // Apply weighted symbol selection based on current RTP and config
  const getWeightedSymbol = useCallback(() => {
    if (!slotConfig || !slotConfig.symbol_weights) {
      // Default random selection if no config
      return symbols[Math.floor(Math.random() * symbols.length)];
    }

    // Get weights from config or set default weights
    const weights = slotConfig.symbol_weights;
    let totalWeight = 0;

    // Calculate total weight and ensure all symbols have weights
    const symbolWeights = symbols.map(symbol => {
      const weight = weights[symbol.id] || 10; // Default weight
      totalWeight += weight;
      return { symbol, weight };
    });

    // Choose random number based on total weight
    const random = Math.random() * totalWeight;
    let weightSum = 0;

    // Find the symbol that corresponds to this random weight value
    for (const { symbol, weight } of symbolWeights) {
      weightSum += weight;
      if (random <= weightSum) {
        return symbol;
      }
    }

    // Failsafe: return last symbol
    return symbols[symbols.length - 1];
  }, [slotConfig, symbols]);

  return { getWeightedSymbol };
};
