import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Trophy, X, Coins, ArrowLeftRight, Menu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface RouletteBet {
  type: string;
  numbers: number[];
  amount: number;
  payout: number;
}

export interface RouletteProps {
  user: User | null;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  isAmerican: boolean;
}

export const BET_TYPES = {
  STRAIGHT: 'Straight',
  SPLIT: 'Split',
  STREET: 'Street',
  CORNER: 'Corner',
  SIXLINE: 'Six Line',  // Added missing SIXLINE type
  LINE: 'Line',
  COLUMN: 'Column',
  DOZEN: 'Dozen',
  RED: 'Red',
  BLACK: 'Black',
  ODD: 'Odd',
  EVEN: 'Even',
  HIGH: 'High (19-36)',
  LOW: 'Low (1-18)',
};

export const PAYOUTS = {
  STRAIGHT: 35,     // 35:1
  SPLIT: 17,        // 17:1
  STREET: 11,       // 11:1
  CORNER: 8,        // 8:1
  SIXLINE: 5,       // Added missing SIXLINE payout
  LINE: 5,          // 5:1
  COLUMN: 2,        // 2:1
  DOZEN: 2,         // 2:1
  OUTSIDE: 1,       // 1:1 (Red/Black, Odd/Even, High/Low)
  RED: 1,           // Added missing RED payout
  BLACK: 1,         // Added missing BLACK payout
  ODD: 1,           // Added missing ODD payout
  EVEN: 1,          // Added missing EVEN payout
  HIGH: 1,          // Added missing HIGH payout
  LOW: 1,           // Added missing LOW payout
};

export const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
];

export const BLACK_NUMBERS = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
];

// Utility function to get color for a number
export const getNumberColor = (number: number): string => {
  if (number === 0 || number === 37) return 'bg-green-700'; // 37 represents 00
  return RED_NUMBERS.includes(number) ? 'bg-red-600' : 'bg-black';
};

export const SpinResultDisplay: React.FC<{
  spinResult: number | null;
  isAmerican: boolean;
}> = ({ spinResult, isAmerican }) => {
  if (spinResult === null) return null;
  
  let displayNumber = spinResult === 37 ? '00' : spinResult.toString();
  let color = getNumberColor(spinResult);
  
  return (
    <div className="flex flex-col items-center mt-4 animate-fade-in">
      <div className="text-lg font-medium">Result</div>
      <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg my-2`}>
        {displayNumber}
      </div>
      <div className="text-sm">
        {spinResult === 0 || spinResult === 37 ? 'Green' : RED_NUMBERS.includes(spinResult) ? 'Red' : 'Black'} • 
        {spinResult % 2 === 0 && spinResult !== 0 && spinResult !== 37 ? ' Even' : spinResult !== 0 && spinResult !== 37 ? ' Odd' : ''} • 
        {spinResult > 0 && spinResult <= 18 && spinResult !== 37 ? 'Low' : spinResult > 18 ? 'High' : ''}
      </div>
    </div>
  );
};

export const BetButtons: React.FC<{
  onPlaceBet: (type: string, numbers: number[], amount: number, payout: number) => void;
  currentBetAmount: number;
  isAmerican: boolean;
}> = ({ onPlaceBet, currentBetAmount, isAmerican }) => {
  const placeBetOutside = (type: string) => {
    let numbers: number[] = [];
    
    switch(type) {
      case BET_TYPES.RED:
        numbers = [...RED_NUMBERS];
        break;
      case BET_TYPES.BLACK:
        numbers = [...BLACK_NUMBERS];
        break;
      case BET_TYPES.ODD:
        numbers = Array.from({ length: isAmerican ? 36 : 37 }, (_, i) => i).filter(n => n % 2 === 1 && n !== 0);
        break;
      case BET_TYPES.EVEN:
        numbers = Array.from({ length: isAmerican ? 36 : 37 }, (_, i) => i).filter(n => n % 2 === 0 && n !== 0);
        break;
      case BET_TYPES.HIGH:
        numbers = Array.from({ length: 18 }, (_, i) => i + 19);
        break;
      case BET_TYPES.LOW:
        numbers = Array.from({ length: 18 }, (_, i) => i + 1);
        break;
      default:
        break;
    }
    
    onPlaceBet(type, numbers, currentBetAmount, PAYOUTS.OUTSIDE);
  };
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-4">
      <Button onClick={() => placeBetOutside(BET_TYPES.RED)} className="bg-red-600 text-white hover:bg-red-700">Red</Button>
      <Button onClick={() => placeBetOutside(BET_TYPES.BLACK)} className="bg-black text-white hover:bg-gray-800">Black</Button>
      <Button onClick={() => placeBetOutside(BET_TYPES.ODD)}>Odd</Button>
      <Button onClick={() => placeBetOutside(BET_TYPES.EVEN)}>Even</Button>
      <Button onClick={() => placeBetOutside(BET_TYPES.LOW)}>1-18</Button>
      <Button onClick={() => placeBetOutside(BET_TYPES.HIGH)}>19-36</Button>
    </div>
  );
};

export const BetChips: React.FC<{
  bets: RouletteBet[];
  onClearBets: () => void;
  gameType: string;
}> = ({ bets, onClearBets, gameType }) => {
  if (bets.length === 0) return null;
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Your Bets</h3>
        <Button size="sm" variant="outline" onClick={onClearBets}>
          Clear All
        </Button>
      </div>
      <div className="space-y-2">
        {bets.map((bet, index) => (
          <div key={index} className="bg-muted/20 p-3 rounded-md flex justify-between">
            <div>
              <div className="font-medium">{bet.type}</div>
              <div className="text-sm text-muted-foreground">
                {bet.type === BET_TYPES.STRAIGHT ? `Number: ${bet.numbers[0]}` :
                 bet.type === BET_TYPES.RED || bet.type === BET_TYPES.BLACK ? bet.type :
                 bet.type === BET_TYPES.ODD ? 'Odd Numbers' :
                 bet.type === BET_TYPES.EVEN ? 'Even Numbers' :
                 bet.type === BET_TYPES.HIGH ? 'Numbers 19-36' :
                 bet.type === BET_TYPES.LOW ? 'Numbers 1-18' :
                 `${bet.numbers.join(', ')}`}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{bet.amount} coins</div>
              <div className="text-sm text-casino-gold">Win: {bet.amount * bet.payout + bet.amount}</div>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-border/30 flex justify-between">
          <div className="font-medium">Total Bet:</div>
          <div className="font-bold">{bets.reduce((sum, bet) => sum + bet.amount, 0)} coins</div>
        </div>
      </div>
    </div>
  );
};

export const RouletteHistory: React.FC<{
  history: { number: number; createdAt: Date }[];
  isAmerican: boolean;
}> = ({ history, isAmerican }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Previous Results</h3>
      {history.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No previous spins yet</div>
      ) : (
        <div className="flex justify-start space-x-2 overflow-x-auto pb-2">
          {history.map((result, index) => {
            const number = result.number;
            const displayNumber = number === 37 ? '00' : number.toString();
            let bgColor = 'bg-green-700';
            
            if (number !== 0 && number !== 37) {
              bgColor = RED_NUMBERS.includes(number) ? 'bg-red-600' : 'bg-black';
            }
            
            return (
              <div key={index} className="flex-shrink-0">
                <div 
                  className={`${bgColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`}
                >
                  {displayNumber}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const updateGameResult = async (
  user: User | null,
  isWin: boolean,
  betAmount: number,
  payout: number,
  bets: RouletteBet[],
  spinResult: number,
  isAmerican: boolean,
  setCoins: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    if (!user) return;
    
    // Update user balance
    const { data: balanceData, error: balanceError } = await supabase.rpc('update_balance', {
      user_uuid: user.id,
      amount: isWin ? payout : 0,
      t_type: isWin ? 'win' : 'loss',
      game_name: isAmerican ? 'roulette-us' : 'roulette-eu',
      meta: { bet_amount: betAmount, payout: payout }
    });
    
    if (balanceError) {
      console.error('Error updating balance:', balanceError);
      toast.error('Failed to update balance');
      return;
    }
    
    // Update coins locally
    if (isWin) {
      setCoins(prev => prev + payout);
    }
    
    // Convert bets data to Json type for proper typing with Supabase
    const betsJson: Json = bets.map(bet => ({
      type: bet.type,
      numbers: bet.numbers,
      amount: bet.amount,
      payout: bet.payout
    }));
    
    // Record game result
    const { error: resultError } = await supabase.from('game_results').insert({
      user_id: user.id,
      game: isAmerican ? 'roulette-us' : 'roulette-eu',
      bet_amount: betAmount,
      win_amount: isWin ? payout : 0,
      is_win: isWin,
      game_data: {
        bets: betsJson,
        result: spinResult
      }
    });
    
    if (resultError) {
      console.error('Error recording game result:', resultError);
    }
    
  } catch (error) {
    console.error('Error in updateGameResult:', error);
    toast.error('Failed to update game result');
  }
};
