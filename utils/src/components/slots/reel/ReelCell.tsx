
import React from 'react';
import { SlotSymbol } from '@/types/slots';
import SlotSymbolDisplay from './SlotSymbolDisplay';
import SpinningReel from './SpinningReel';

interface ReelCellProps {
  spinning: boolean;
  symbol: SlotSymbol;
  reelData: SlotSymbol[];
  hasWin: boolean;
  rowIndex: number;
}

const ReelCell: React.FC<ReelCellProps> = ({ 
  spinning, 
  symbol, 
  reelData, 
  hasWin,
  rowIndex
}) => {
  return (
    <div 
      key={`reel-${rowIndex}`}
      className="w-20 h-24 bg-black/30 rounded-md border-2 border-casino-gold/50 flex items-center justify-center overflow-hidden"
    >
      {spinning ? (
        <SpinningReel reelData={reelData} />
      ) : (
        <SlotSymbolDisplay symbol={symbol} hasWin={hasWin} />
      )}
    </div>
  );
};

export default ReelCell;
