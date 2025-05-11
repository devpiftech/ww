
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { SlotMachineConfig } from '@/types/admin';
import { Coins, Settings, Dices } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SlotConfigCardProps {
  config: SlotMachineConfig;
  onSave: (config: SlotMachineConfig) => void;
  onToggleStatus: (gameId: string, enabled: boolean) => void;
}

const SlotConfigCard: React.FC<SlotConfigCardProps> = ({ 
  config, 
  onSave,
  onToggleStatus
}) => {
  const [editedConfig, setEditedConfig] = useState<SlotMachineConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSymbolWeightChange = (symbolId: string, weight: number) => {
    const newWeights = { 
      ...editedConfig.symbol_weights, 
      [symbolId]: weight 
    };
    setEditedConfig({ ...editedConfig, symbol_weights: newWeights });
  };
  
  const handlePayoutChange = (key: string, value: number) => {
    const newPayouts = { 
      ...editedConfig.payouts, 
      [key]: value 
    };
    setEditedConfig({ ...editedConfig, payouts: newPayouts });
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save directly to database to ensure settings take effect immediately
      const { error } = await supabase
        .from('slot_configs')
        .update({
          name: editedConfig.name,
          min_bet: editedConfig.min_bet,
          max_bet: editedConfig.max_bet,
          rtp: editedConfig.rtp,
          house_edge: editedConfig.house_edge,
          reels: editedConfig.reels,
          symbols_per_reel: editedConfig.symbols_per_reel,
          bonus_frequency: editedConfig.bonus_frequency,
          symbol_weights: editedConfig.symbol_weights,
          payouts: editedConfig.payouts,
          special_features: editedConfig.special_features,
          enabled: editedConfig.enabled
        })
        .eq('id', config.id);
      
      if (error) {
        throw error;
      }
      
      onSave(editedConfig);
      toast.success(`Saved ${config.name} configuration`);
      
      // Log the update for verification
      console.log('Slot configuration updated:', editedConfig);
    } catch (err) {
      console.error("Error saving slot config:", err);
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
                  .from('slot_configs')
                  .update({ enabled: checked })
                  .eq('id', config.id);
                  
                if (error) throw error;
                
                setEditedConfig({...editedConfig, enabled: checked});
                onToggleStatus(config.id, checked);
              } catch (err) {
                console.error("Error toggling slot status:", err);
                toast.error("Failed to update slot machine status");
              }
            }}
          />
        </div>
        <CardDescription>
          Configure slot machine parameters, payouts, and odds
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              Machine Parameters
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
                  max={50} 
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
                  min={50} 
                  max={1000} 
                  step={50}
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
                  min={85} 
                  max={99} 
                  step={0.5}
                  onValueChange={(value) => {
                    setEditedConfig({ 
                      ...editedConfig, 
                      rtp: value[0], 
                      house_edge: 100 - value[0] 
                    });
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bonus Frequency</span>
                  <span className="text-sm">{editedConfig.bonus_frequency}%</span>
                </div>
                <Slider 
                  value={[editedConfig.bonus_frequency]} 
                  min={1} 
                  max={20} 
                  step={0.5}
                  onValueChange={(value) => {
                    setEditedConfig({ ...editedConfig, bonus_frequency: value[0] });
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Dices className="h-4 w-4 mr-1" />
              Symbol Weights
            </h4>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {Object.entries(editedConfig.symbol_weights || {}).map(([symbolId, weight]) => (
                <div key={symbolId} className="flex items-center gap-2">
                  <Input 
                    value={weight}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value) || 1;
                      handleSymbolWeightChange(symbolId, newValue);
                    }}
                    type="number"
                    className="w-20"
                    min={1}
                    step={1}
                  />
                  <span className="text-sm capitalize flex-1">
                    {symbolId.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Coins className="h-4 w-4 mr-1" />
              Payout Configuration
            </h4>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {Object.entries(editedConfig.payouts || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Input 
                    value={value}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value) || 0;
                      handlePayoutChange(key, newValue);
                    }}
                    type="number"
                    className="w-24"
                    min={0}
                    step={1}
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

export default SlotConfigCard;
