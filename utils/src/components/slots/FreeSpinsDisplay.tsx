
import React from 'react';

interface FreeSpinsDisplayProps {
  freeSpins: number;
  multiplier: number;
}

const FreeSpinsDisplay: React.FC<FreeSpinsDisplayProps> = ({ freeSpins, multiplier }) => {
  if (freeSpins === 0) return null;
  
  return (
    <div className="bg-casino-purple/20 p-2 rounded-md text-center mb-4 animate-pulse">
      <span className="font-bold text-casino-gold">
        {freeSpins} {freeSpins === 1 ? 'Free Orbit' : 'Free Orbits'} Remaining
      </span>
      {multiplier > 1 && (
        <span className="ml-2 text-sm">({multiplier}x Gravity Multiplier)</span>
      )}
    </div>
  );
};

export default FreeSpinsDisplay;
