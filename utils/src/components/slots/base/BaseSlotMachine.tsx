
import React from 'react';
import { SlotSymbol } from '@/types/slots';
import { SlotMachineConfig } from '@/types/admin';
import { BaseSlotMachineProvider, BaseSlotMachineProps, useSlotMachineContext } from './BaseSlotMachineProvider';
import SlotMachineDisplay from './SlotMachineDisplay';
import SlotMachineControls from './SlotMachineControls';
import { useSlotMachineTracking } from './useSlotMachineTracking';

const BaseSlotMachine: React.FC<BaseSlotMachineProps> = (props) => {
  return (
    <BaseSlotMachineProvider {...props}>
      <BaseSlotMachineContent
        machineName={props.machineName}
        reels={props.reels}
        rows={props.rows}
      />
    </BaseSlotMachineProvider>
  );
};

interface BaseSlotMachineContentProps {
  machineName: string;
  reels: number;
  rows: number;
}

const BaseSlotMachineContent: React.FC<BaseSlotMachineContentProps> = ({
  machineName,
  reels,
  rows
}) => {
  // Get all necessary data from context
  const { state, reelData, spin, changeBet, configMinBet, configMaxBet } = useSlotMachineContext();

  // Initialize tracking functionality
  const { trackWin } = useSlotMachineTracking({
    state,
    machineName,
    reels,
    rows
  });
  
  return (
    <div className="casino-card p-6 max-w-lg mx-auto">
      <h3 className="text-xl font-bold text-center mb-4">{machineName}</h3>
      
      <SlotMachineDisplay
        reelData={reelData}
        results={state.results}
        spinning={state.spinning}
        lastWin={state.lastWin}
        reels={reels}
      />
      
      <SlotMachineControls
        coins={state.coins}
        betAmount={state.betAmount}
        minBet={configMinBet}
        maxBet={configMaxBet}
        spinning={state.spinning}
        freeSpins={state.freeSpins}
        multiplier={state.multiplier}
        lastWin={state.lastWin}
        onChangeBet={changeBet}
        onSpin={() => {
          spin();
          if (state.lastWin > 0) {
            trackWin(state.lastWin);
          }
        }}
      />
    </div>
  );
};

export default BaseSlotMachine;
