
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { SlotSymbol } from '@/types/slots';

interface UseSimpleSlotMachineProps {
  initialCoins: number;
  symbols: SlotSymbol[];
  onWin?: (amount: number) => void;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

export const useSimpleSlotMachine = ({ 
  initialCoins, 
  symbols, 
  onWin, 
  setCoins 
}: UseSimpleSlotMachineProps) => {
  const [reels, setReels] = useState<Array<SlotSymbol[]>>(Array(3).fill([...symbols]));
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<SlotSymbol[][]>([
    [symbols[0]], [symbols[0]], [symbols[0]]
  ]);
  const [betAmount, setBetAmount] = useState(10);
  const [lastWin, setLastWin] = useState(0);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spinInProgressRef = useRef<boolean>(false);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);
  
  // Create a function to shuffle the symbols
  const shuffleReels = () => {
    return Array(3).fill(0).map(() => 
      [...symbols].sort(() => Math.random() - 0.5)
    );
  };
  
  // Function to handle spinning
  const spin = () => {
    // Prevent multiple spins while one is in progress
    if (spinInProgressRef.current || spinning) return;
    
    // Check if user has enough coins
    if (initialCoins < betAmount) {
      toast.error("Not enough coins!", {
        description: "Please add more coins to continue playing."
      });
      return;
    }
    
    // Set spin in progress flag
    spinInProgressRef.current = true;
    
    // Deduct bet amount
    setCoins(prev => prev - betAmount);
    
    // Start spinning
    setSpinning(true);
    setReels(shuffleReels());
    
    // Clear any existing timeout to prevent multiple timeouts
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
    }
    
    // Stop spinning after a very short time (300-500ms)
    const spinTime = 300 + Math.random() * 200;
    
    spinTimeoutRef.current = setTimeout(() => {
      // Generate random results for each reel
      const newResults = Array(3).fill(0).map(() => {
        const randomIndex = Math.floor(Math.random() * symbols.length);
        return [symbols[randomIndex]];
      });
      
      // Update the results and stop spinning
      setResults(newResults);
      setSpinning(false);
      
      // Check for win after stopping
      setTimeout(() => {
        checkWin(newResults.map(reel => reel[0]));
        // Reset spin in progress flag
        spinInProgressRef.current = false;
      }, 100);
      
    }, spinTime);
  };

  // Check for winning combinations
  const checkWin = (rowSymbols: Array<SlotSymbol>) => {
    // Count occurrences of each symbol
    const symbolCount: Record<string, number> = {};
    rowSymbols.forEach(symbol => {
      symbolCount[symbol.id] = (symbolCount[symbol.id] || 0) + 1;
    });
    
    // Find the symbol with the most occurrences
    let maxCount = 0;
    let maxSymbol: SlotSymbol | null = null;
    
    for (const symbol of rowSymbols) {
      const count = symbolCount[symbol.id];
      if (count > maxCount) {
        maxCount = count;
        maxSymbol = symbol;
      }
    }
    
    // Determine win amount based on combinations
    let winAmount = 0;
    
    if (maxCount === 3 && maxSymbol) {
      // All three symbols are the same - big win!
      winAmount = maxSymbol.value * betAmount * 5;
      
      toast.success(`JACKPOT! ${maxSymbol.emoji}${maxSymbol.emoji}${maxSymbol.emoji}`, {
        description: `You won ${winAmount} coins!`,
        duration: 5000,
      });
    } else if (maxCount === 2 && maxSymbol) {
      // Two matching symbols
      winAmount = maxSymbol.value * betAmount / 2;
      
      toast.success(`Nice! Two matching ${maxSymbol.emoji}`, {
        description: `You won ${winAmount} coins!`
      });
    }
    
    if (winAmount > 0) {
      setCoins(prev => prev + winAmount);
      setLastWin(winAmount);
      if (onWin) onWin(winAmount);
    } else {
      setLastWin(0);
    }
  };
  
  // Change bet amount
  const changeBet = (amount: number) => {
    if (!spinning) {
      if (amount >= 10 && amount <= 100) {
        setBetAmount(amount);
      }
    }
  };

  return {
    reels,
    spinning,
    results,
    betAmount,
    lastWin,
    changeBet,
    spin
  };
};
