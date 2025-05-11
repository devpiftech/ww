
import React from 'react';
import { Button } from '@/components/ui/button';

interface BettingControlsProps {
  betAmount: number;
  maxBet: number;
  isLoading: boolean;
  onBetChange: (amount: number) => void;
  onStartGame: () => void;
}

const BettingControls: React.FC<BettingControlsProps> = ({
  betAmount,
  maxBet,
  isLoading,
  onBetChange,
  onStartGame
}) => {
  return (
    <div className="mt-4 flex flex-col items-center space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={() => onBetChange(-5)}
          disabled={betAmount <= 5}
          className="border-white/30 text-white hover:bg-white/10"
        >
          -5
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onBetChange(-25)}
          disabled={betAmount <= 25}
          className="border-white/30 text-white hover:bg-white/10"
        >
          -25
        </Button>
        <div className="bg-black/30 rounded-md px-4 py-2 min-w-[80px] text-center">
          <span className="text-yellow-300 font-bold">{betAmount}</span>
        </div>
        <Button 
          variant="outline" 
          onClick={() => onBetChange(25)}
          disabled={betAmount + 25 > maxBet}
          className="border-white/30 text-white hover:bg-white/10"
        >
          +25
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onBetChange(5)}
          disabled={betAmount + 5 > maxBet}
          className="border-white/30 text-white hover:bg-white/10"
        >
          +5
        </Button>
      </div>
      
      <Button
        disabled={isLoading}
        onClick={onStartGame}
        className="bg-casino-gold text-black hover:bg-yellow-400 w-full py-6 text-lg font-bold"
      >
        {isLoading ? 'Dealing...' : `Deal Cards (Bet ${betAmount})`}
      </Button>
    </div>
  );
};

export default BettingControls;
