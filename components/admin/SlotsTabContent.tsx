
import React from 'react';
import SlotConfigCard from './SlotConfigCard';
import { SlotMachineConfig } from '@/types/admin';

interface SlotsTabContentProps {
  slotConfigs: SlotMachineConfig[];
  onSaveSlotConfig: (config: SlotMachineConfig) => void;
  onToggleSlotStatus: (gameId: string, enabled: boolean) => void;
}

const SlotsTabContent: React.FC<SlotsTabContentProps> = ({ 
  slotConfigs, 
  onSaveSlotConfig, 
  onToggleSlotStatus 
}) => {
  return (
    <div className="space-y-6">
      {slotConfigs.map(config => (
        <SlotConfigCard 
          key={config.id} 
          config={config}
          onSave={onSaveSlotConfig}
          onToggleStatus={onToggleSlotStatus}
        />
      ))}
    </div>
  );
};

export default SlotsTabContent;
