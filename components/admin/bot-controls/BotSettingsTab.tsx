
import React from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface BotConfigType {
  minBots: number;
  maxBots: number;
  chatFrequency: number;
  joinFrequency: number;
  leaveFrequency: number;
  gameTimeMin: number;
  gameTimeMax: number;
}

interface BotSettingsTabProps {
  config: BotConfigType;
  isRunning: boolean;
  onConfigChange: (key: string, value: number) => void;
  onStartSimulation: () => void;
  formatMs: (ms: number) => string;
}

const BotSettingsTab: React.FC<BotSettingsTabProps> = ({
  config,
  isRunning,
  onConfigChange,
  onStartSimulation,
  formatMs
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="minBots">Minimum Bots</Label>
          <div className="flex items-center gap-4">
            <Slider 
              id="minBots" 
              defaultValue={[config.minBots]} 
              min={1} 
              max={10} 
              step={1}
              onValueChange={(value) => onConfigChange('minBots', value[0])}
            />
            <span className="w-8 text-right">{config.minBots}</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="maxBots">Maximum Bots</Label>
          <div className="flex items-center gap-4">
            <Slider 
              id="maxBots" 
              defaultValue={[config.maxBots]} 
              min={config.minBots} 
              max={20} 
              step={1}
              onValueChange={(value) => onConfigChange('maxBots', value[0])}
            />
            <span className="w-8 text-right">{config.maxBots}</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="chatFrequency">Chat Frequency</Label>
          <div className="flex items-center gap-4">
            <Slider 
              id="chatFrequency" 
              defaultValue={[config.chatFrequency / 1000]} 
              min={10} 
              max={120} 
              step={5}
              onValueChange={(value) => onConfigChange('chatFrequency', value[0] * 1000)}
            />
            <span className="w-16 text-right">{config.chatFrequency / 1000}s</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="joinFrequency">Join Frequency</Label>
          <div className="flex items-center gap-4">
            <Slider 
              id="joinFrequency" 
              defaultValue={[config.joinFrequency / 1000]} 
              min={15} 
              max={180} 
              step={5}
              onValueChange={(value) => onConfigChange('joinFrequency', value[0] * 1000)}
            />
            <span className="w-16 text-right">{config.joinFrequency / 1000}s</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="leaveFrequency">Leave Frequency</Label>
          <div className="flex items-center gap-4">
            <Slider 
              id="leaveFrequency" 
              defaultValue={[config.leaveFrequency / 1000]} 
              min={15} 
              max={240} 
              step={5}
              onValueChange={(value) => onConfigChange('leaveFrequency', value[0] * 1000)}
            />
            <span className="w-16 text-right">{config.leaveFrequency / 1000}s</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="gameTimeMin">Min Game Time</Label>
          <div className="flex items-center gap-4">
            <Slider 
              id="gameTimeMin" 
              defaultValue={[config.gameTimeMin / 1000]} 
              min={30} 
              max={300} 
              step={10}
              onValueChange={(value) => onConfigChange('gameTimeMin', value[0] * 1000)}
            />
            <span className="w-16 text-right">{formatMs(config.gameTimeMin)}</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="gameTimeMax">Max Game Time</Label>
          <div className="flex items-center gap-4">
            <Slider 
              id="gameTimeMax" 
              defaultValue={[config.gameTimeMax / 1000]} 
              min={config.gameTimeMin / 1000} 
              max={600} 
              step={10}
              onValueChange={(value) => onConfigChange('gameTimeMax', value[0] * 1000)}
            />
            <span className="w-16 text-right">{formatMs(config.gameTimeMax)}</span>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onStartSimulation} 
            disabled={isRunning}
          >
            Apply Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BotSettingsTab;
