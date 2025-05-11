
import React from 'react';
import { SlotSymbol } from '@/types/slots';
import ReelCell from './reel/ReelCell';

interface SlotReelProps {
  spinning: boolean;
  reelData: SlotSymbol[];
  results: SlotSymbol[];
  hasWin: boolean;
}

const SlotReel: React.FC<SlotReelProps> = ({ spinning, reelData, results, hasWin }) => {
  return (
    <div className="flex flex-col gap-2">
      {results.map((symbol, rowIndex) => (
        <ReelCell
          key={rowIndex}
          spinning={spinning}
          symbol={symbol}
          reelData={reelData}
          hasWin={hasWin}
          rowIndex={rowIndex}
        />
      ))}
    </div>
  );
};

export default SlotReel;
