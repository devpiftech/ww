
import React from 'react';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';

interface BetControlsProps {
  coins: number;
  betAmount: number;
  minBet: number;
  maxBet: number;
  spinning: boolean;
  onChangeBet: (amount: number) => void;
}

const BetControls: React.FC<BetControlsProps> = ({
  coins,
  betAmount,
  minBet,
  maxBet,
  spinning,
  onChangeBet
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-1">
        <Coins className="h-5 w-5 text-casino-gold" />
        <span className="font-bold text-lg">{coins}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onChangeBet(Math.max(minBet, betAmount - 10))}
          disabled={spinning || betAmount <= minBet}
          className="border-casino-gold/30 text-casino-gold"
        >
          -
        </Button>
        
        <div className="bg-muted/30 px-3 py-1 rounded text-casino-gold font-bold min-w-[60px] text-center">
          {betAmount}
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onChangeBet(Math.min(maxBet, betAmount + 10))}
          disabled={spinning || betAmount >= maxBet}
          className="border-casino-gold/30 text-casino-gold"
        >
          +
        </Button>
      </div>
    </div>
  );
};

export default BetControls;
