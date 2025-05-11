
import React from 'react';
import { useSlotMachine } from '@/hooks/slots/useSlotMachine';
import { SlotSymbol } from '@/types/slots';
import { SlotMachineConfig } from '@/types/admin';
import { useGameConfig } from '@/hooks/gameConfig';

export interface BaseSlotMachineProps {
  initialCoins: number;
  symbols: SlotSymbol[];
  reels: number;
  rows: number;
  minBet: number;
  maxBet: number;
  onWin?: (amount: number) => void;
  machineName: string;
  onSaveBalance?: (balance: number) => void;
  slotType?: string;
  slotConfig?: SlotMachineConfig;
}

export interface SlotMachineContextType {
  state: any;
  reelData: SlotSymbol[][];
  spin: () => void;
  changeBet: (amount: number) => void;
  configMinBet: number;
  configMaxBet: number;
  effectiveConfig?: SlotMachineConfig;
  trackWin: (amount: number) => void;
}

export const SlotMachineContext = React.createContext<SlotMachineContextType | undefined>(undefined);

export const BaseSlotMachineProvider: React.FC<BaseSlotMachineProps & { children: React.ReactNode }> = ({
  initialCoins,
  symbols,
  reels,
  rows,
  minBet,
  maxBet,
  onWin,
  machineName,
  onSaveBalance,
  slotType = 'classic',
  slotConfig,
  children
}) => {
  // If slotConfig is not provided explicitly, get it from the database
  const { config: fetchedConfig } = !slotConfig ? useGameConfig({ 
    gameId: `slot-${slotType}`, 
    isSlotMachine: true 
  }) : { config: null };
  
  // Use provided slotConfig or fallback to fetched config
  const effectiveConfig = slotConfig || (fetchedConfig as SlotMachineConfig);
  
  console.log('SlotMachineProvider using effective config:', effectiveConfig);
  
  // Use configuration-based min/max bets if available
  const configMinBet = effectiveConfig?.min_bet ?? minBet;
  const configMaxBet = effectiveConfig?.max_bet ?? maxBet;

  // Initialize the slot machine logic with the config
  const { state, reelData, spin, changeBet } = useSlotMachine({
    initialCoins,
    symbols,
    reels,
    rows,
    minBet: configMinBet,
    maxBet: configMaxBet,
    onWin: (amount) => {
      // Track the win
      if (onWin) onWin(amount);
    },
    onSaveBalance,
    slotType,
    slotConfig: effectiveConfig
  });

  // Create a trackWin function that will be passed to the context
  const trackWin = (amount: number) => {
    if (onWin) onWin(amount);
  };

  // Create the context value
  const contextValue: SlotMachineContextType = {
    state,
    reelData,
    spin,
    changeBet,
    configMinBet,
    configMaxBet,
    effectiveConfig,
    trackWin
  };

  // Provide the context to children components
  return (
    <SlotMachineContext.Provider value={contextValue}>
      {children}
    </SlotMachineContext.Provider>
  );
};

// Custom hook to use the slot machine context
export const useSlotMachineContext = () => {
  const context = React.useContext(SlotMachineContext);
  if (context === undefined) {
    throw new Error('useSlotMachineContext must be used within a BaseSlotMachineProvider');
  }
  return context;
};
