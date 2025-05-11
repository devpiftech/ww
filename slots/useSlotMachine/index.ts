
import { useRef, useCallback, useEffect } from 'react';
import { useStateManager } from './useStateManager';
import { useConfigHandler } from './useConfigHandler';
import { useSpinLogic } from './useSpinLogic';
import { useTracking } from './useTracking';
import { UseSlotMachineProps, UseSlotMachineResult } from './types';

export const useSlotMachine = ({
  initialCoins,
  symbols,
  reels,
  rows,
  minBet,
  maxBet,
  onWin,
  onSaveBalance,
  slotType = 'classic',
  slotConfig: providedSlotConfig
}: UseSlotMachineProps): UseSlotMachineResult => {
  // Get configuration
  const { slotConfig } = useConfigHandler({
    slotType,
    providedConfig: providedSlotConfig
  });

  // Initialize state management
  const { state, setState, reelData, setReelData } = useStateManager(
    initialCoins,
    symbols,
    reels,
    rows,
    minBet,
    onSaveBalance
  );

  // Initialize tracking
  const { trackGameResult } = useTracking(slotType);

  // Refs for managing spin state and cleanup
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const spinInProgressRef = useRef<boolean>(false);

  // Set up mounted flag for cleanup
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;

    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;

      // Clear any pending timeouts
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
        spinTimeoutRef.current = null;
      }

      // Save final balance if callback provided
      if (onSaveBalance) {
        onSaveBalance(state.coins);
      }
    };
  }, [onSaveBalance, state.coins]); // Explicitly include dependencies

  // Initialize spin logic
  const { spin } = useSpinLogic({
    state,
    setState,
    symbols,
    reels,
    rows,
    onWin,
    slotConfig,
    setReelData,
    isMountedRef,
    spinTimeoutRef,
    spinInProgressRef,
    trackGameResult
  });

  // Change bet amount
  const changeBet = useCallback((amount: number) => {
    // If we have a config from the database, use its min/max bet values
    const configMinBet = slotConfig ? slotConfig.min_bet : minBet;
    const configMaxBet = slotConfig ? slotConfig.max_bet : maxBet;

    if (!state.spinning && amount >= configMinBet && amount <= configMaxBet) {
      setState(prev => ({
        ...prev,
        betAmount: amount
      }));
    }
  }, [state.spinning, minBet, maxBet, slotConfig, setState]);

  return {
    state,
    reelData,
    spin,
    changeBet,
    slotConfig
  };
};

export * from './types';
