
import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { HelpCircle, Coins } from 'lucide-react';
import { SPACE_SYMBOLS } from './SpaceSymbols';

interface SpaceFeaturesProps {
  coins: number;
  onAddCoins: () => void;
}

const SpaceFeatures: React.FC<SpaceFeaturesProps> = ({ coins, onAddCoins }) => {
  return (
    <Card className="bg-gradient-to-b from-indigo-900/80 to-black/70 border-indigo-500/20 shadow-xl p-6">
      <h3 className="text-xl font-bold text-indigo-200 mb-4">Space Features</h3>
      <ul className="space-y-3 text-slate-200">
        <li className="flex gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>5 reels with expanding wilds and bonus rounds</span>
        </li>
        <li className="flex gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>🌌 Galaxy is wild and expands to fill the reel</span>
        </li>
        <li className="flex gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>🛸 UFO triggers the bonus abduction feature</span>
        </li>
        <li className="flex gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>Higher risk but bigger rewards!</span>
        </li>
      </ul>
      
      <Separator className="my-6 bg-indigo-500/30" />
      
      <h3 className="text-xl font-bold text-indigo-200 mb-4">Symbol Values</h3>
      <div className="grid grid-cols-2 gap-3">
        {SPACE_SYMBOLS.filter(s => !s.isScatter).map(symbol => (
          <div key={symbol.id} className="flex items-center gap-2 text-slate-200">
            <div className="text-2xl">{symbol.emoji}</div>
            <span>{symbol.value}x bet</span>
          </div>
        ))}
      </div>
      
      <Separator className="my-6 bg-indigo-500/30" />
      
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          className="border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:bg-indigo-900/30"
          onClick={onAddCoins}
        >
          <Coins className="h-4 w-4 mr-2" />
          Get Free Coins
        </Button>
        <div className="text-indigo-200 font-bold">
          <span className="text-sm text-indigo-400 mr-1">Balance:</span>
          {coins}
        </div>
      </div>
    </Card>
  );
};

export default SpaceFeatures;
