
import { useEffect, useState } from 'react';
import { SlotMachineConfig } from '@/types/admin';
import { useGameConfig } from '@/hooks/gameConfig';
import { ConfigHandlerProps } from './types';

export const useConfigHandler = ({ slotType, providedConfig }: ConfigHandlerProps) => {
  const { config: fetchedConfig, refetchConfig } = useGameConfig({
    gameId: `slot-${slotType}`,
    isSlotMachine: true
  });

  const [slotConfig, setSlotConfig] = useState<SlotMachineConfig | null>(null);

  useEffect(() => {
    if (providedConfig) {
      setSlotConfig(providedConfig);
    } else if (fetchedConfig) {
      setSlotConfig(fetchedConfig as SlotMachineConfig);
    }
  }, [providedConfig, fetchedConfig]);

  useEffect(() => {
    if (slotConfig) {
      console.log('✅ Slot Config Loaded:', slotConfig);
    }
  }, [slotConfig]);

  return {
    slotConfig,
    refetchConfig
  };
};
