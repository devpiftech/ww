import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BotConfigData, BotSimulationConfig } from '@/services/types/supabaseTypes';
import { startBotSimulation } from '@/services/bots';
import { nanoid } from 'nanoid';

interface BotInfo {
  id: string;
  min_bots: number;
  max_bots: number;
  join_frequency: number;
  chat_frequency: number;
  leave_frequency: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const BotControlPanel: React.FC = () => {
  const [botInfos, setBotInfos] = useState<BotInfo[]>([]);
  const [newBot, setNewBot] = useState({
    min_bots: 1,
    max_bots: 5,
    join_frequency: 30000,
    chat_frequency: 60000,
    leave_frequency: 45000,
    is_active: true,
  });

  useEffect(() => {
    // Load initial bot configurations from local storage or default values
    const storedBots = localStorage.getItem('botConfigs');
    if (storedBots) {
      setBotInfos(JSON.parse(storedBots));
    } else {
      // Initialize with a default bot configuration
      const defaultBot: BotInfo = {
        id: nanoid(),
        min_bots: 3,
        max_bots: 8,
        join_frequency: 45000,
        chat_frequency: 60000,
        leave_frequency: 90000,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setBotInfos([defaultBot]);
    }
  }, []);

  useEffect(() => {
    // Save bot configurations to local storage whenever they change
    localStorage.setItem('botConfigs', JSON.stringify(botInfos));
  }, [botInfos]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBot({ ...newBot, [e.target.name]: parseInt(e.target.value, 10) });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBot({ ...newBot, is_active: e.target.checked });
  };

  const createNewBot = async () => {
    try {
      const botId = nanoid();
      const newBotConfig: BotConfigData = {
        id: botId,
        min_bots: newBot.min_bots,
        max_bots: newBot.max_bots,
        join_frequency: newBot.join_frequency,
        chat_frequency: newBot.chat_frequency,
        leave_frequency: newBot.leave_frequency,
        is_active: newBot.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setBotInfos(prev => [...prev, newBotConfig]);
      toast.success(`New bot configuration created successfully`);

      // Start the bot simulation with compatible properties
      const botSimConfig: BotSimulationConfig = {
        id: botId,
        enabled: newBot.is_active,
        min_bet: 5,
        max_bet: 100,
        min_wait: 3000,
        max_wait: 10000,
        games: ['slots', 'blackjack', 'roulette-us', 'roulette-eu'],
        created_at: new Date().toISOString(),
        minBots: newBot.min_bots,
        maxBots: newBot.max_bots,
        joinFrequency: newBot.join_frequency,
        chatFrequency: newBot.chat_frequency,
        leaveFrequency: newBot.leave_frequency
      };

      await startBotSimulation(botSimConfig);
    } catch (error) {
      console.error('Error creating bot configuration:', error);
      toast.error('Failed to create bot configuration');
    }
  };

  const saveBotConfig = async (formData: BotConfigData) => {
    try {
      setBotInfos(prev => {
        const updated = [...prev];
        const index = updated.findIndex(b => b.id === formData.id);
        
        const configToSave: BotConfigData = {
          id: formData.id,
          min_bots: formData.min_bots,
          max_bots: formData.max_bots,
          join_frequency: formData.join_frequency,
          chat_frequency: formData.chat_frequency,
          leave_frequency: formData.leave_frequency,
          is_active: formData.is_active,
          created_at: formData.created_at,
          updated_at: new Date().toISOString()
        };
        
        if (index >= 0) {
          updated[index] = configToSave;
        } else {
          updated.push(configToSave);
        }
        
        return updated;
      });
      
      // Simulate local bot configuration save
      toast.success(`Bot configuration saved successfully`);
      
      // Start the bot simulation with compatible properties
      const botSimConfig: BotSimulationConfig = {
        id: formData.id,
        enabled: formData.is_active,
        min_bet: 5,
        max_bet: 100,
        min_wait: 3000,
        max_wait: 10000,
        games: ['slots', 'blackjack', 'roulette-us', 'roulette-eu'],
        created_at: formData.created_at,
        minBots: formData.min_bots,
        maxBots: formData.max_bots,
        joinFrequency: formData.join_frequency,
        chatFrequency: formData.chat_frequency,
        leaveFrequency: formData.leave_frequency
      };
      
      await startBotSimulation(botSimConfig);
    } catch (error) {
      console.error('Error saving bot configuration:', error);
      toast.error('Failed to save bot configuration');
    }
  };

  const deleteBotConfig = async (botId: string) => {
    try {
      setBotInfos(prev => prev.filter(bot => bot.id !== botId));
      toast.success(`Bot configuration deleted successfully`);
    } catch (error) {
      console.error('Error deleting bot configuration:', error);
      toast.error('Failed to delete bot configuration');
    }
  };

  return (
    <div className="container py-4">
      <Card>
        <CardHeader>
          <CardTitle>Bot Configuration</CardTitle>
          <CardDescription>Manage bot behavior and settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min_bots">Min Bots</Label>
              <Input
                type="number"
                id="min_bots"
                name="min_bots"
                defaultValue={newBot.min_bots.toString()}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="max_bots">Max Bots</Label>
              <Input
                type="number"
                id="max_bots"
                name="max_bots"
                defaultValue={newBot.max_bots.toString()}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                name="is_active"
                checked={newBot.is_active}
                onCheckedChange={(checked) => handleSwitchChange({ target: { name: 'is_active', checked } } as any)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="join_frequency">Join Frequency (ms)</Label>
              <Input
                type="number"
                id="join_frequency"
                name="join_frequency"
                defaultValue={newBot.join_frequency.toString()}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="chat_frequency">Chat Frequency (ms)</Label>
              <Input
                type="number"
                id="chat_frequency"
                name="chat_frequency"
                defaultValue={newBot.chat_frequency.toString()}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="leave_frequency">Leave Frequency (ms)</Label>
              <Input
                type="number"
                id="leave_frequency"
                name="leave_frequency"
                defaultValue={newBot.leave_frequency.toString()}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <Button onClick={createNewBot}>Create New Bot</Button>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Existing Bot Configurations</CardTitle>
          <CardDescription>Modify or delete existing bot configurations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your bot configurations.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Min Bots</TableHead>
                <TableHead className="w-[100px]">Max Bots</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Join Frequency</TableHead>
                <TableHead>Chat Frequency</TableHead>
                <TableHead>Leave Frequency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {botInfos.map((bot) => (
                <TableRow key={bot.id}>
                  <TableCell className="font-medium">{bot.min_bots}</TableCell>
                  <TableCell className="font-medium">{bot.max_bots}</TableCell>
                  <TableCell>{bot.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{bot.join_frequency}</TableCell>
                  <TableCell>{bot.chat_frequency}</TableCell>
                  <TableCell>{bot.leave_frequency}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="secondary" size="sm" onClick={() => saveBotConfig(bot)}>
                      Save
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteBotConfig(bot.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BotControlPanel;
