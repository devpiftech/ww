
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Coins, Star } from 'lucide-react';
import BaseSlotMachine from './BaseSlotMachine';
import { SlotSymbol } from '@/types/slots';

// Fruity slot symbols
const FRUITY_SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', value: 8, emoji: '🍒' },
  { id: 'strawberry', value: 10, emoji: '🍓' },
  { id: 'lemon', value: 15, emoji: '🍋' },
  { id: 'orange', value: 20, emoji: '🍊' },
  { id: 'apple', value: 25, emoji: '🍎' },
  { id: 'watermelon', value: 30, emoji: '🍉' },
  { id: 'grapes', value: 40, emoji: '🍇' }, 
  { id: 'banana', value: 50, emoji: '🍌' },
  { id: 'star', value: 100, emoji: '⭐', isWild: true },
  { id: 'scatter', value: 0, emoji: '🎁', isScatter: true }
];

const FruitySlotMachine: React.FC = () => {
  const [coins, setCoins] = useState(1000);
  const navigate = useNavigate();
  
  const handleWin = (amount: number) => {
    console.log(`Won ${amount} coins`);
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
        <h1 className="text-3xl font-bold">Fruit Frenzy</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BaseSlotMachine 
            initialCoins={coins} 
            symbols={FRUITY_SYMBOLS} 
            reels={5} 
            rows={3}
            minBet={20}
            maxBet={200}
            onWin={handleWin}
            machineName="Fruit Frenzy" 
            onSaveBalance={setCoins}
          />
        </div>
        
        <div className="lg:col-span-1">
          <Card className="bg-card border-border/30 shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">How To Play</h3>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <HelpCircle className="h-5 w-5 text-casino-gold flex-shrink-0 mt-0.5" />
                <span>This is a 5-reel slot with multiple paylines</span>
              </li>
              <li className="flex gap-2">
                <HelpCircle className="h-5 w-5 text-casino-gold flex-shrink-0 mt-0.5" />
                <span><Star className="h-4 w-4 inline text-yellow-500" /> is a Wild symbol and substitutes any fruit</span>
              </li>
              <li className="flex gap-2">
                <HelpCircle className="h-5 w-5 text-casino-gold flex-shrink-0 mt-0.5" />
                <span>🎁 is a Scatter - get 3+ for free spins bonus</span>
              </li>
              <li className="flex gap-2">
                <HelpCircle className="h-5 w-5 text-casino-gold flex-shrink-0 mt-0.5" />
                <span>Free spins come with a 2x win multiplier!</span>
              </li>
            </ul>
            
            <Separator className="my-6 bg-border/30" />
            
            <h3 className="text-xl font-bold mb-4">Symbol Values</h3>
            <div className="grid grid-cols-2 gap-3">
              {FRUITY_SYMBOLS.filter(s => !s.isScatter).map(symbol => (
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
        </div>
      </div>
    </Layout>
  );
};

export default FruitySlotMachine;
