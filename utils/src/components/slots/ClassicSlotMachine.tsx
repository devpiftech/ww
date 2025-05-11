
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Coins, Trophy } from 'lucide-react';
import BaseSlotMachine from './BaseSlotMachine';
import { SlotSymbol } from '@/types/slots';
import SlotTournaments from '../tournaments/SlotTournaments';
import { useGameConfig } from '@/hooks/useGameConfig';
import { SlotMachineConfig } from '@/types/admin';

// Classic slot symbols
const CLASSIC_SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', value: 10, emoji: '🍒' },
  { id: 'lemon', value: 20, emoji: '🍋' },
  { id: 'orange', value: 30, emoji: '🍊' },
  { id: 'watermelon', value: 40, emoji: '🍉' },
  { id: 'bell', value: 50, emoji: '🔔' },
  { id: 'seven', value: 100, emoji: '7️⃣' },
  { id: 'diamond', value: 200, emoji: '💎' },
];

const ClassicSlotMachine: React.FC = () => {
  const [coins, setCoins] = useState(1000);
  const [showTournaments, setShowTournaments] = useState(false);
  const navigate = useNavigate();
  
  // Get the latest slot configuration from the database with more specific typing
  const { config, isLoading, error } = useGameConfig({ 
    gameId: 'slot-classic',
    isSlotMachine: true
  });
  
  const slotConfig = config as SlotMachineConfig | undefined;
  
  // Log config to check if it's being loaded correctly
  useEffect(() => {
    if (slotConfig) {
      console.log('Slot configuration loaded:', slotConfig);
      console.log('RTP value:', slotConfig.rtp);
      console.log('Symbol weights:', slotConfig.symbol_weights);
      console.log('Payouts:', slotConfig.payouts);
    } else if (error) {
      console.error('Error loading slot configuration:', error);
    }
  }, [slotConfig, error]);
  
  // Get the payout values from the configuration
  const getConfigPayout = (symbolId: string): number => {
    if (!slotConfig) return 0;
    
    const payoutKey = `three_${symbolId}`;
    const payout = slotConfig.payouts[payoutKey];
    
    if (payout === undefined) return 0;
    return typeof payout === 'string' ? parseFloat(payout) : payout;
  };
  
  // Updated symbols with payouts from config
  const [configuredSymbols, setConfiguredSymbols] = useState<SlotSymbol[]>(CLASSIC_SYMBOLS);
  
  // Update symbols with configured payouts when config loads
  useEffect(() => {
    if (!slotConfig) return;
    
    const updatedSymbols = CLASSIC_SYMBOLS.map(symbol => ({
      ...symbol,
      value: getConfigPayout(symbol.id) || symbol.value // Fallback to default if not in config
    }));
    
    console.log('Updated symbols with config values:', updatedSymbols);
    setConfiguredSymbols(updatedSymbols);
  }, [slotConfig]);
  
  const handleWin = (amount: number) => {
    console.log(`Won ${amount} coins`);
  };
  
  // Get min and max bets from config
  const minBet = slotConfig ? slotConfig.min_bet : 10;
  const maxBet = slotConfig ? slotConfig.max_bet : 100;
  
  return (
    <Layout>
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2" 
          onClick={() => navigate('/slots')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Lucky Spinner</h1>
        
        <Button
          variant="outline"
          size="sm"
          className="ml-auto flex items-center gap-1"
          onClick={() => setShowTournaments(!showTournaments)}
        >
          <Trophy className="h-4 w-4 text-casino-gold" />
          <span>{showTournaments ? 'Hide Tournaments' : 'Show Tournaments'}</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-10">Loading slot configuration...</div>
          ) : (
            <BaseSlotMachine 
              initialCoins={coins} 
              symbols={configuredSymbols} 
              reels={3} 
              rows={1}
              minBet={minBet}
              maxBet={maxBet}
              onWin={handleWin}
              machineName="Lucky Spinner" 
              onSaveBalance={setCoins}
              slotType="classic"
              slotConfig={slotConfig}
            />
          )}
        </div>
        
        <div className="lg:col-span-1">
          {showTournaments ? (
            <SlotTournaments machineType="classic" />
          ) : (
            <Card className="bg-card border-border/30 shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">How To Play</h3>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <HelpCircle className="h-5 w-5 text-casino-gold flex-shrink-0 mt-0.5" />
                  <span>Select your bet amount using + and - buttons</span>
                </li>
                <li className="flex gap-2">
                  <HelpCircle className="h-5 w-5 text-casino-gold flex-shrink-0 mt-0.5" />
                  <span>Click SPIN to start the game</span>
                </li>
                <li className="flex gap-2">
                  <HelpCircle className="h-5 w-5 text-casino-gold flex-shrink-0 mt-0.5" />
                  <span>Match 3 identical symbols for a big win!</span>
                </li>
                <li className="flex gap-2">
                  <HelpCircle className="h-5 w-5 text-casino-gold flex-shrink-0 mt-0.5" />
                  <span>Match 2 identical symbols for a smaller win</span>
                </li>
              </ul>
              
              <Separator className="my-6 bg-border/30" />
              
              <h3 className="text-xl font-bold mb-4">Symbol Values</h3>
              <div className="grid grid-cols-2 gap-3">
                {configuredSymbols.map(symbol => (
                  <div key={symbol.id} className="flex items-center gap-2">
                    <div className="text-2xl">{symbol.emoji}</div>
                    <span>{symbol.value}x bet</span>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6 bg-border/30" />
              
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  className="border-casino-gold/50 hover:border-casino-gold text-casino-gold hover:bg-casino-gold/10"
                  onClick={() => setCoins(prev => prev + 1000)}
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Get Free Coins
                </Button>
                <div className="text-casino-gold font-bold">
                  <span className="text-sm text-muted-foreground mr-1">Balance:</span>
                  {coins}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ClassicSlotMachine;
