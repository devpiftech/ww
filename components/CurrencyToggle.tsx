
import React from 'react';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import { UserPreferences } from '@/types/database';

interface CurrencyToggleProps {
  preferences: { preferredCurrency: 'waynebucks' | 'waynesweeps' };
  onToggle: (currency: 'waynebucks' | 'waynesweeps') => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ 
  preferences, 
  onToggle, 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs h-7',
    md: 'text-sm h-9',
    lg: 'text-base h-10',
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 text-sm mr-1">
        <Coins className={`${size === 'sm' ? 'h-3.5 w-3.5' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <span>Currency:</span>
      </div>
      
      <div className="flex gap-1">
        <Button
          variant={preferences.preferredCurrency === 'waynebucks' ? 'default' : 'outline'}
          className={`
            ${sizeClasses[size]} 
            ${preferences.preferredCurrency === 'waynebucks' ? 'bg-casino-gold hover:bg-casino-gold/90' : ''}
          `}
          onClick={() => onToggle('waynebucks')}
        >
          WayneBucks
        </Button>
        <Button
          variant={preferences.preferredCurrency === 'waynesweeps' ? 'default' : 'outline'}
          className={`
            ${sizeClasses[size]} 
            ${preferences.preferredCurrency === 'waynesweeps' ? 'bg-casino-purple hover:bg-casino-purple/90' : ''}
          `}
          onClick={() => onToggle('waynesweeps')}
        >
          WayneSweeps
        </Button>
      </div>
    </div>
  );
};

export default CurrencyToggle;
