
import React from 'react';
import { SlotSymbol } from '@/types/slots';

interface SlotSymbolDisplayProps {
  symbol: SlotSymbol;
  hasWin: boolean;
}

const SlotSymbolDisplay: React.FC<SlotSymbolDisplayProps> = ({ symbol, hasWin }) => {
  return (
    <div className={`text-4xl ${hasWin ? 'animate-pulse-glow' : ''}`}>
      {symbol.emoji}
    </div>
  );
};

export default SlotSymbolDisplay;
