
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Coins, Settings } from 'lucide-react';
import { GameConfig } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

interface GameConfigCardProps {
  config: GameConfig;
  onSave: (config: GameConfig) => void;
  onToggleStatus: (gameId: string, enabled: boolean) => void;
}

const GameConfigCard: React.FC<GameConfigCardProps> = ({ 
  config, 
  onSave,
  onToggleStatus
}) => {
  const [editedConfig, setEditedConfig] = useState<GameConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save directly to database to ensure settings take effect immediately
      const { error } = await supabase
        .from('game_configs')
        .update({
          name: editedConfig.name,
          min_bet: editedConfig.min_bet,
          max_bet: editedConfig.max_bet,
          rtp: editedConfig.rtp,
          house_edge: editedConfig.house_edge,
          payouts: editedConfig.payouts,
          enabled: editedConfig.enabled
        })
        .eq('id', config.id);
      
      if (error) {
        throw error;
      }
      
      onSave(editedConfig);
      toast.success(`Saved ${config.name} configuration`);
      
      // Log the update for verification
      console.log('Game configuration updated:', editedConfig);
    } catch (err) {
      console.error("Error saving game config:", err);
      toast.error(`Failed to save configuration: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card key={config.id} className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            {config.name}
            <Badge variant={editedConfig.enabled ? "default" : "secondary"}>
              {editedConfig.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </CardTitle>
          <Switch 
            checked={editedConfig.enabled}
            onCheckedChange={async (checked) => {
              // Update directly in database
              try {
                const { error } = await supabase
                  .from('game_configs')
                  .update({ enabled: checked })
                  .eq('id', config.id);
                  
                if (error) throw error;
                
                setEditedConfig({...editedConfig, enabled: checked});
                onToggleStatus(config.id, checked);
              } catch (err) {
                console.error("Error toggling game status:", err);
                toast.error("Failed to update game status");
              }
            }}
          />
        </div>
        <CardDescription>
          Configure game parameters, payouts, and limits
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Settings className="h-4 w-4 mr-1" />
                Game Parameters
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Min Bet</span>
                    <span className="text-sm">{editedConfig.min_bet}</span>
                  </div>
                  <Slider 
                    value={[editedConfig.min_bet]} 
                    min={1} 
                    max={100} 
                    step={1}
                    onValueChange={(value) => {
                      setEditedConfig({ ...editedConfig, min_bet: value[0] });
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max Bet</span>
                    <span className="text-sm">{editedConfig.max_bet}</span>
                  </div>
                  <Slider 
                    value={[editedConfig.max_bet]} 
                    min={100} 
                    max={10000} 
                    step={100}
                    onValueChange={(value) => {
                      setEditedConfig({ ...editedConfig, max_bet: value[0] });
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Return to Player (RTP)</span>
                    <span className="text-sm">{editedConfig.rtp}%</span>
                  </div>
                  <Slider 
                    value={[editedConfig.rtp]} 
                    min={80} 
                    max={99.9} 
                    step={0.1}
                    onValueChange={(value) => {
                      setEditedConfig({ 
                        ...editedConfig, 
                        rtp: value[0], 
                        house_edge: 100 - value[0] 
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Coins className="h-4 w-4 mr-1" />
              Payout Configuration
            </h4>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {Object.entries(editedConfig.payouts).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Input 
                    value={value}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value) || 0;
                      const newPayouts = { 
                        ...editedConfig.payouts, 
                        [key]: newValue 
                      };
                      setEditedConfig({ ...editedConfig, payouts: newPayouts });
                    }}
                    type="number"
                    className="w-24"
                    min={0}
                    step={0.1}
                  />
                  <span className="text-sm capitalize flex-1">
                    {key.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameConfigCard;
