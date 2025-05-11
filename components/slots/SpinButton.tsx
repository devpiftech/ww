
import React from 'react';
import { Button } from '@/components/ui/button';
import { CirclePlay } from 'lucide-react';

interface SpinButtonProps {
  spinning: boolean;
  disabled: boolean;
  freeSpins: number;
  onSpin: () => void;
}

const SpinButton: React.FC<SpinButtonProps> = ({ 
  spinning, 
  disabled, 
  freeSpins, 
  onSpin 
}) => {
  return (
    <Button 
      className="casino-btn-secondary w-full text-lg py-6 relative overflow-hidden"
      disabled={disabled}
      onClick={onSpin}
    >
      {spinning ? (
        <span className="flex items-center gap-2">
          <CirclePlay className="h-5 w-5 animate-spin" />
          <span className="animate-pulse">Spinning...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {freeSpins > 0 && (
            <span className="absolute top-0 right-2 bg-casino-purple text-xs px-2 py-0.5 rounded-b font-bold">
              {freeSpins} FREE
            </span>
          )}
          <span className={freeSpins > 0 ? "mt-1" : ""}>
            {freeSpins > 0 ? 'SPIN (FREE)' : 'SPIN'}
          </span>
        </span>
      )}
    </Button>
  );
};

export default SpinButton;
