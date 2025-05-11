
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Coins, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CurrencySelector from '@/components/CurrencySelector';

interface SportsbookHeaderProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  onCurrencyChange: (currency: 'waynebucks' | 'waynesweeps') => void;
  currency: 'waynebucks' | 'waynesweeps';
}

const SportsbookHeader: React.FC<SportsbookHeaderProps> = ({ 
  balance, 
  setBalance, 
  onCurrencyChange,
  currency
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 transition-all hover:scale-110" 
          onClick={() => navigate('/games')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          <Trophy className="h-6 w-6 text-casino-gold animate-pulse-glow mr-2" />
          <h1 className="text-3xl font-bold">Sportsbook</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">Your Balance:</div>
        <div className="flex items-center px-3 py-1 bg-card rounded-lg border border-casino-gold/30 animate-pulse-glow">
          <Coins className="h-4 w-4 text-casino-gold mr-1.5" />
          <span className="font-bold">{balance}</span>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setBalance(prevBalance => prevBalance + 1000)}
          className="border-casino-gold/50 hover:border-casino-gold text-casino-gold transition-all hover:scale-105 hover:shadow-lg"
        >
          + Deposit
        </Button>
        <CurrencySelector onCurrencyChange={onCurrencyChange} />
      </div>
    </div>
  );
};

export default SportsbookHeader;
