
import React from 'react';
import { SlotSymbol } from '@/types/slots';
import SlotMachineLayout from './simple/SlotMachineLayout';
import { useSimpleSlotMachine } from '@/hooks/slots/useSimpleSlotMachine';

// Slot symbols with their corresponding values
const SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', value: 10, emoji: '🍒' },
  { id: 'lemon', value: 20, emoji: '🍋' },
  { id: 'orange', value: 30, emoji: '🍊' },
  { id: 'watermelon', value: 40, emoji: '🍉' },
  { id: 'bell', value: 50, emoji: '🔔' },
  { id: 'seven', value: 100, emoji: '7️⃣' },
  { id: 'diamond', value: 200, emoji: '💎' },
];

interface SimpleSlotMachineProps {
  onWin?: (amount: number) => void;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

const SimpleSlotMachine: React.FC<SimpleSlotMachineProps> = ({ 
  onWin, 
  coins, 
  setCoins 
}) => {
  const {
    reels,
    spinning,
    results,
    betAmount,
    lastWin,
    changeBet,
    spin
  } = useSimpleSlotMachine({
    initialCoins: coins,
    symbols: SYMBOLS,
    onWin,
    setCoins
  });
  
  return (
    <SlotMachineLayout
      title="Lucky Spinner"
      reels={reels}
      spinning={spinning}
      results={results}
      betAmount={betAmount}
      lastWin={lastWin}
      coins={coins}
      onChangeBet={changeBet}
      onSpin={spin}
    />
  );
};

export default SimpleSlotMachine;
