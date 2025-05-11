
import React from 'react';
import BetControls from '../BetControls';
import FreeSpinsDisplay from '../FreeSpinsDisplay';
import SpinButton from '../SpinButton';
import WinDisplay from '../WinDisplay';

interface SlotMachineControlsProps {
  coins: number;
  betAmount: number;
  minBet: number;
  maxBet: number;
  spinning: boolean;
  freeSpins: number;
  multiplier: number;
  lastWin: number;
  onChangeBet: (amount: number) => void;
  onSpin: () => void;
}

const SlotMachineControls: React.FC<SlotMachineControlsProps> = ({
  coins,
  betAmount,
  minBet,
  maxBet,
  spinning,
  freeSpins,
  multiplier,
  lastWin,
  onChangeBet,
  onSpin
}) => {
  return (
    <>
      <BetControls
        coins={coins}
        betAmount={betAmount}
        minBet={minBet}
        maxBet={maxBet}
        spinning={spinning}
        onChangeBet={onChangeBet}
      />
      
      <FreeSpinsDisplay
        freeSpins={freeSpins}
        multiplier={multiplier}
      />
      
      <SpinButton
        spinning={spinning}
        disabled={spinning || (coins < betAmount && freeSpins === 0)}
        freeSpins={freeSpins}
        onSpin={onSpin}
      />
      
      <WinDisplay lastWin={lastWin} />
    </>
  );
};

export default SlotMachineControls;
