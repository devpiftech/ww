
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Coins, Dices } from 'lucide-react';
import { SlotSymbol } from '@/types/slots';
import SlotReel from './SlotReel';
import BetControls from './BetControls';
import SpinButton from './SpinButton';
import WinDisplay from './WinDisplay';

// Slot symbols with their corresponding values
const SYMBOLS = [
  { id: 'cherry', value: 10, emoji: '🍒' },
  { id: 'lemon', value: 20, emoji: '🍋' },
  { id: 'orange', value: 30, emoji: '🍊' },
  { id: 'watermelon', value: 40, emoji: '🍉' },
  { id: 'bell', value: 50, emoji: '🔔' },
  { id: 'seven', value: 100, emoji: '7️⃣' },
  { id: 'diamond', value: 200, emoji: '💎' },
];

interface SlotMachineProps {
  onWin?: (amount: number) => void;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

const OldSlotMachine: React.FC<SlotMachineProps> = ({ onWin, coins, setCoins }) => {
  const [reels, setReels] = useState<Array<SlotSymbol[]>>(Array(3).fill([...SYMBOLS]));
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<Array<SlotSymbol>>([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  const [betAmount, setBetAmount] = useState(10);
  const [lastWin, setLastWin] = useState(0);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spinInProgressRef = useRef<boolean>(false);
  
  // Create a function to shuffle the symbols
  const shuffleReels = () => {
    return Array(3).fill(0).map(() => 
      [...SYMBOLS].sort(() => Math.random() - 0.5)
    );
  };
  
  // Function to handle spinning
  const spin = () => {
    // Prevent multiple spins while one is in progress
    if (spinInProgressRef.current) return;
    
    // Check if user has enough coins
    if (coins < betAmount) {
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
    
    // Stop spinning after random time (1.5 - 3 seconds)
    const spinTime = 1500 + Math.random() * 1500;
    
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
    }
    
    spinTimeoutRef.current = setTimeout(() => {
      // Generate random results for each reel
      const newResults = Array(3).fill(0).map(() => {
        const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
        return SYMBOLS[randomIndex];
      });
      
      setResults(newResults);
      checkWin(newResults);
      setSpinning(false);
      
      // Reset spin in progress flag
      spinInProgressRef.current = false;
    }, spinTime);
  };
  
  // Check for winning combinations
  const checkWin = (results: Array<SlotSymbol>) => {
    // Count occurrences of each symbol
    const symbolCount: Record<string, number> = {};
    results.forEach(symbol => {
      symbolCount[symbol.id] = (symbolCount[symbol.id] || 0) + 1;
    });
    
    // Find the symbol with the most occurrences
    let maxCount = 0;
    let maxSymbol: SlotSymbol | null = null;
    
    for (const symbol of results) {
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
  
  return (
    <div className="casino-card p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-center mb-4">Lucky Spinner</h3>
      
      <div className="bg-casino-dark/70 p-4 rounded-lg mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-casino-purple/10 to-transparent opacity-50"></div>
        
        <div className="flex justify-center gap-2 relative z-10">
          {[0, 1, 2].map((reelIndex) => (
            <div 
              key={reelIndex} 
              className="w-20 h-24 bg-black/30 rounded-md border-2 border-casino-gold/50 flex items-center justify-center overflow-hidden"
            >
              {spinning ? (
                <div className="animate-slot-spin">
                  {reels[reelIndex].map((symbol, idx) => (
                    <div key={idx} className="h-24 flex items-center justify-center text-4xl">
                      {symbol.emoji}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-4xl ${lastWin > 0 ? 'animate-pulse-glow' : ''}`}>
                  {results[reelIndex]?.emoji || SYMBOLS[0].emoji}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <BetControls
        coins={coins}
        betAmount={betAmount}
        minBet={10}
        maxBet={100}
        spinning={spinning}
        onChangeBet={changeBet}
      />
      
      <SpinButton
        spinning={spinning}
        disabled={spinning || coins < betAmount}
        freeSpins={0}
        onSpin={spin}
      />
      
      {lastWin > 0 && <WinDisplay lastWin={lastWin} />}
    </div>
  );
};

export default OldSlotMachine;
