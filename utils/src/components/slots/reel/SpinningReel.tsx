
import React from 'react';
import { SlotSymbol } from '@/types/slots';

interface SpinningReelProps {
  reelData: SlotSymbol[];
}

const SpinningReel: React.FC<SpinningReelProps> = ({ reelData }) => {
  return (
    <div className="animate-slot-spin">
      {reelData.map((symbol, idx) => (
        <div key={idx} className="h-24 flex items-center justify-center text-4xl">
          {symbol.emoji}
        </div>
      ))}
    </div>
  );
};

export default SpinningReel;
