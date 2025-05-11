
import React from 'react';
import GameConfigCard from './GameConfigCard';
import { GameConfig } from '@/types/admin';

interface GameSettingsTabProps {
  gameConfigs: GameConfig[];
  onSaveConfig: (config: GameConfig) => void;
  onToggleGameStatus: (gameId: string, enabled: boolean) => void;
}

const GameSettingsTab: React.FC<GameSettingsTabProps> = ({ 
  gameConfigs, 
  onSaveConfig, 
  onToggleGameStatus 
}) => {
  return (
    <div className="space-y-4">
      {gameConfigs.map(config => (
        <GameConfigCard 
          key={config.id} 
          config={config}
          onSave={onSaveConfig}
          onToggleStatus={onToggleGameStatus}
        />
      ))}
    </div>
  );
};

export default GameSettingsTab;
