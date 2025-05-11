
import React from 'react';
import { SlotSymbol } from '@/types/slots';
import SlotReel from '../SlotReel';
import BetControls from '../BetControls';
import SpinButton from '../SpinButton';
import WinDisplay from '../WinDisplay';

interface SlotMachineLayoutProps {
  title: string;
  reels: SlotSymbol[][];
  spinning: boolean;
  results: SlotSymbol[][];
  betAmount: number;
  lastWin: number;
  coins: number;
  onChangeBet: (amount: number) => void;
  onSpin: () => void;
}

const SlotMachineLayout: React.FC<SlotMachineLayoutProps> = ({
  title,
  reels,
  spinning,
  results,
  betAmount,
  lastWin,
  coins,
  onChangeBet,
  onSpin
}) => {
  return (
    <div className="casino-card p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-center mb-4">{title}</h3>
      
      <div className="bg-casino-dark/70 p-4 rounded-lg mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-casino-purple/10 to-transparent opacity-50"></div>
        
        <div className="flex justify-center gap-2 relative z-10">
          {[0, 1, 2].map((reelIndex) => (
            <SlotReel
              key={reelIndex}
              spinning={spinning}
              reelData={reels[reelIndex]}
              results={results[reelIndex]}
              hasWin={lastWin > 0}
            />
          ))}
        </div>
      </div>
      
      <BetControls
        coins={coins}
        betAmount={betAmount}
        minBet={10}
        maxBet={100}
        spinning={spinning}
        onChangeBet={onChangeBet}
      />
      
      <SpinButton
        spinning={spinning}
        disabled={spinning || coins < betAmount}
        freeSpins={0}
        onSpin={onSpin}
      />
      
      <WinDisplay lastWin={lastWin} />
    </div>
  );
};

export default SlotMachineLayout;
