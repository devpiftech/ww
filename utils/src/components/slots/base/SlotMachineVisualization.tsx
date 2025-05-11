
import React from 'react';
import SlotReel from '../SlotReel';
import { SlotSymbol } from '@/types/slots';

interface SlotMachineVisualizationProps {
  reelData: SlotSymbol[][];
  results: SlotSymbol[][];
  spinning: boolean;
  lastWin: number;
  reels: number;
}

const SlotMachineVisualization: React.FC<SlotMachineVisualizationProps> = ({
  reelData,
  results,
  spinning,
  lastWin,
  reels
}) => {
  return (
    <div className="flex justify-center gap-2 relative z-10">
      {Array(reels).fill(0).map((_, reelIndex) => (
        <SlotReel
          key={reelIndex}
          spinning={spinning}
          reelData={reelData[reelIndex]}
          results={results[reelIndex]}
          hasWin={lastWin > 0}
        />
      ))}
    </div>
  );
};

export default SlotMachineVisualization;
