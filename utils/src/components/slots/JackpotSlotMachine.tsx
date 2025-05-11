
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Coins, Diamond } from 'lucide-react';
import BaseSlotMachine from './BaseSlotMachine';
import { SlotSymbol } from '@/types/slots';
import { Progress } from '@/components/ui/progress';

// Jackpot slot symbols
const JACKPOT_SYMBOLS: SlotSymbol[] = [
  { id: 'bar', value: 20, emoji: '📊' },
  { id: 'bell', value: 30, emoji: '🔔' },
  { id: 'cherry', value: 40, emoji: '🍒' },
  { id: 'clover', value: 50, emoji: '🍀' },
  { id: 'horseshoe', value: 60, emoji: '🧲' },
  { id: 'seven', value: 77, emoji: '7️⃣' },
  { id: 'crown', value: 100, emoji: '👑' },
  { id: 'diamond', value: 200, emoji: '💎', isWild: true },
  { id: 'bonus', value: 0, emoji: '🎰', isBonus: true, isScatter: true },
];

const JACKPOT_TIERS = [
  { name: "Mini", amount: 1000, color: "bg-green-500" },
  { name: "Minor", amount: 5000, color: "bg-blue-500" },
  { name: "Major", amount: 25000, color: "bg-purple-500" },
  { name: "Mega", amount: 100000, color: "bg-red-500" }
];

const JackpotSlotMachine: React.FC = () => {
  const [coins, setCoins] = useState(1000);
  const [jackpots, setJackpots] = useState(JACKPOT_TIERS.map(tier => ({ ...tier })));
  const [jackpotProgress, setJackpotProgress] = useState(0);
  const navigate = useNavigate();
  
  // Simulate increasing jackpots over time
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpots(prev => prev.map(jackpot => ({
        ...jackpot,
        amount: jackpot.amount + Math.floor(Math.random() * 10)
      })));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleWin = (amount: number) => {
    // Increase jackpot progress when winning
    setJackpotProgress(prev => {
      const newProgress = Math.min(prev + (amount / 1000), 100);
      
      // If jackpot is triggered
      if (newProgress >= 100) {
        // Random jackpot tier (weighted toward smaller jackpots)
        const rand = Math.random();
        let tierIndex = 0;
        
        if (rand > 0.97) tierIndex = 3; // Mega - 3% chance
        else if (rand > 0.90) tierIndex = 2; // Major - 7% chance
        else if (rand > 0.70) tierIndex = 1; // Minor - 20% chance
        else tierIndex = 0; // Mini - 70% chance
        
        // Award jackpot
        const jackpotWin = jackpots[tierIndex].amount;
        setCoins(prev => prev + jackpotWin);
        
        // Reset progress and reduce jackpot
        setTimeout(() => {
          setJackpots(prev => {
            const newJackpots = [...prev];
            newJackpots[tierIndex].amount = JACKPOT_TIERS[tierIndex].amount;
            return newJackpots;
          });
        }, 5000);
        
        return 0; // Reset progress
      }
      
      return newProgress;
    });
  };
  
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
        <h1 className="text-3xl font-bold">Mega Jackpot</h1>
      </div>
      
      {/* Jackpot Display */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {jackpots.map((jackpot) => (
          <Card 
            key={jackpot.name}
            className={`border-${jackpot.color.replace('bg-', '')}/30 p-4 text-center`}
          >
            <h3 className="text-lg font-bold mb-1">{jackpot.name}</h3>
            <p className={`text-xl font-mono ${jackpot.color.replace('bg-', 'text-')}`}>
              {jackpot.amount.toLocaleString()}
            </p>
          </Card>
        ))}
      </div>
      
      {/* Progress to jackpot */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Jackpot Chance</span>
          <span className="text-sm font-medium">{Math.round(jackpotProgress)}%</span>
        </div>
        <Progress value={jackpotProgress} className="h-2" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-b from-amber-900/40 to-black/80 p-6 rounded-lg">
            <BaseSlotMachine 
              initialCoins={coins} 
              symbols={JACKPOT_SYMBOLS} 
              reels={5} 
              rows={3}
              minBet={100}
              maxBet={1000}
              onWin={handleWin}
              machineName="Mega Jackpot" 
              onSaveBalance={setCoins}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-b from-amber-900/40 to-black/80 border-amber-500/30 shadow-xl p-6">
            <h3 className="text-xl font-bold text-amber-200 mb-4 flex items-center">
              <Diamond className="h-5 w-5 mr-2 text-amber-500" />
              Progressive Jackpots
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <HelpCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">Four progressive jackpot tiers</span>
              </li>
              <li className="flex gap-2">
                <HelpCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">Every win increases jackpot chance</span>
              </li>
              <li className="flex gap-2">
                <HelpCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">Higher bets give better jackpot odds</span>
              </li>
            </ul>
            
            <Separator className="my-6 bg-amber-500/30" />
            
            <h3 className="text-xl font-bold text-amber-200 mb-4">Symbol Values</h3>
            <div className="grid grid-cols-2 gap-3">
              {JACKPOT_SYMBOLS.filter(s => !s.isScatter).map(symbol => (
                <div key={symbol.id} className="flex items-center gap-2 text-slate-200">
                  <div className="text-2xl">{symbol.emoji}</div>
                  <span>{symbol.value}x bet</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-6 bg-amber-500/30" />
            
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                className="border-amber-500/50 hover:border-amber-400 text-amber-300 hover:bg-amber-900/30"
                onClick={() => setCoins(prev => prev + 5000)}
              >
                <Coins className="h-4 w-4 mr-2" />
                Get 5000 Coins
              </Button>
              <div className="text-amber-200 font-bold">
                <span className="text-sm text-amber-400 mr-1">Balance:</span>
                {coins}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default JackpotSlotMachine;
