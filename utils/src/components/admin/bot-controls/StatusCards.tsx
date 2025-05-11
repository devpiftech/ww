
import React from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pause, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface StatusCardsProps {
  isRunning: boolean;
  botCount: number;
  config: {
    minBots: number;
    maxBots: number;
  };
  onToggleSimulation: () => void;
}

const StatusCards: React.FC<StatusCardsProps> = ({ 
  isRunning, 
  botCount, 
  config, 
  onToggleSimulation 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <Card className="p-4 border-2 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Bot Simulation</span>
            <span className="font-bold text-lg">{isRunning ? 'Active' : 'Inactive'}</span>
          </div>
          
          <Switch 
            checked={isRunning} 
            onCheckedChange={onToggleSimulation} 
          />
        </div>
      </Card>
      
      <Card className="p-4 border-2 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Active Bots</span>
            <span className="font-bold text-lg">{botCount}</span>
          </div>
          
          <Badge variant={isRunning ? 'default' : 'secondary'} className="text-xs">
            {isRunning ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </Card>
      
      <Card className="p-4 border-2 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Target Range</span>
            <span className="font-bold text-lg">{config.minBots} - {config.maxBots} bots</span>
          </div>
          
          <Button variant="outline" size="sm" className="h-8" onClick={onToggleSimulation}>
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Start
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StatusCards;
