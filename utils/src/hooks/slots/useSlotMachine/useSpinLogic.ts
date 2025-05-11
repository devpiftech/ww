
import { useCallback } from 'react';
import { toast } from 'sonner';
import { checkWin } from '../winLogic';
import { generateReelData } from '../slotReelUtils';
import { SpinLogicProps } from './types';

export const useSpinLogic = ({
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
}: SpinLogicProps) => {
  // Function to generate results based on weighted symbols
  const generateSpinResults = useCallback(() => {
    // Use slotConfig weightings if available
    const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];
    
    const newResults = [];
    for (let i = 0; i < reels; i++) {
      const reelSymbols = [];
      for (let j = 0; j < rows; j++) {
        reelSymbols.push(getRandomSymbol());
      }
      newResults.push(reelSymbols);
    }
    
    return newResults;
  }, [reels, rows, symbols]);

  // Function to handle spinning
  const spin = useCallback(() => {
    // Prevent multiple spins
    if (spinInProgressRef.current || state.spinning) {
      console.log("Spin already in progress, ignoring");
      return;
    }

    // Check if user has enough coins
    if (state.coins < state.betAmount && state.freeSpins === 0) {
      toast.error("Not enough coins!", {
        description: "Please add more coins to continue playing."
      });
      return;
    }

    // Set spinning flags
    spinInProgressRef.current = true;

    // Generate new reel data for animation
    const newReelData = generateReelData(symbols, reels);
    setReelData(newReelData);

    // Start spinning animation
    setState(prev => ({
      ...prev,
      spinning: true,
      // Deduct bet unless using free spins
      coins: prev.freeSpins > 0 ? prev.coins : prev.coins - prev.betAmount,
      freeSpins: prev.freeSpins > 0 ? prev.freeSpins - 1 : 0,
      lastWin: 0 // Reset last win at start of spin
    }));

    // Generate spin results based on configured RTP
    const newResults = generateSpinResults();

    // Clear any existing timeout
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }

    // Set new timeout to stop spinning and show results (1.5 - 3 seconds)
    const spinTime = 1500 + Math.random() * 1500;
    console.log(`Setting spin timeout for ${spinTime}ms`);

    spinTimeoutRef.current = setTimeout(() => {
      // Check if component is still mounted
      if (!isMountedRef.current) {
        console.log("Component unmounted, not updating state");
        spinInProgressRef.current = false;
        return;
      }

      console.log("Spin timeout completed, stopping animation");

      // Stop spinning animation and show results
      setState(prev => ({
        ...prev,
        spinning: false,
        results: newResults
      }));

      // ✅ Fix: reset spin flag
      spinInProgressRef.current = false;

      // Check for wins after results are shown
      setTimeout(() => {
        if (isMountedRef.current) {
          console.log("Checking for wins with config:", slotConfig);
          // Pass the slot config to the win logic
          checkWin(newResults, state, setState, rows, reels, symbols, onWin, slotConfig);
          spinInProgressRef.current = false;

          // Track this game result
          trackGameResult(state.betAmount, state.lastWin);
        }
      }, 100);

      // Clear the timeout reference
      spinTimeoutRef.current = null;
    }, spinTime);
  }, [state, setState, symbols, reels, rows, generateSpinResults, onWin, slotConfig, setReelData, isMountedRef, spinTimeoutRef, spinInProgressRef, trackGameResult]);

  return { spin };
};
