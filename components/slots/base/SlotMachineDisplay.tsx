
import React from 'react';
import SlotMachineVisualization from './SlotMachineVisualization';
import { SlotSymbol } from '@/types/slots';

interface SlotMachineDisplayProps {
  reelData: SlotSymbol[][];
  results: SlotSymbol[][];
  spinning: boolean;
  lastWin: number;
  reels: number;
}

const SlotMachineDisplay: React.FC<SlotMachineDisplayProps> = ({
  reelData,
  results,
  spinning,
  lastWin,
  reels
}) => {
  return (
    <div className="bg-casino-dark/70 p-4 rounded-lg mb-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-casino-purple/10 to-transparent opacity-50"></div>
      
      <SlotMachineVisualization
        reelData={reelData}
        results={results}
        spinning={spinning}
        lastWin={lastWin}
        reels={reels}
      />
    </div>
  );
};

export default SlotMachineDisplay;
