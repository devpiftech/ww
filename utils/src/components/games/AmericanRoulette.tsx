
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import {
  RouletteProps,
  RouletteBet,
  BET_TYPES,
  PAYOUTS,
  getNumberColor,
  SpinResultDisplay,
  BetButtons,
  BetChips,
  RouletteHistory,
  updateGameResult
} from './RouletteCommon';
import RouletteBoard from './RouletteBoard';

const AmericanRoulette: React.FC<RouletteProps> = ({ user, coins, setCoins, isAmerican = true }) => {
  const [currentBetAmount, setCurrentBetAmount] = useState(10);
  const [bets, setBets] = useState<RouletteBet[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [history, setHistory] = useState<{ number: number; createdAt: Date }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('play');
  
  const MIN_BET = 5;
  const MAX_BET = Math.min(1000, coins);
  
  // Load game history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', user.id)
        .eq('game', 'roulette-us')
        .order('created_at', { ascending: false })
        .limit(20);
      
      setIsLoading(false);
      
      if (error) {
        console.error('Error fetching game history:', error);
        return;
      }
      
      if (data) {
        const history = data.map(item => {
          let resultNumber = 0;
          
          if (item.game_data && 
              typeof item.game_data === 'object' && 
              !Array.isArray(item.game_data) &&
              'result' in item.game_data) {
            resultNumber = Number(item.game_data.result);
          }
          
          return {
            number: resultNumber,
            createdAt: new Date(item.created_at)
          };
        });
        
        setHistory(history);
      }
    };
    
    fetchHistory();
  }, [user]);
  
  // Handle bet amount change
  const handleBetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value);
    
    if (isNaN(value)) {
      setCurrentBetAmount(MIN_BET);
      return;
    }
    
    if (value < MIN_BET) value = MIN_BET;
    if (value > MAX_BET) value = MAX_BET;
    
    setCurrentBetAmount(value);
  };
  
  const incrementBet = (amount: number) => {
    setCurrentBetAmount(prev => Math.min(MAX_BET, prev + amount));
  };
  
  const decrementBet = (amount: number) => {
    setCurrentBetAmount(prev => Math.max(MIN_BET, prev - amount));
  };
  
  const placeBet = (type: string, numbers: number[], amount: number, payout: number) => {
    // Check if user has enough coins
    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0) + amount;
    if (totalBetAmount > coins) {
      toast.error('Not enough coins for this bet');
      return;
    }
    
    setBets(prev => [...prev, { type, numbers, amount, payout }]);
    toast.success(`Bet placed on ${type}`);
  };
  
  const clearBets = () => {
    setBets([]);
  };
  
  const handleSpin = async () => {
    if (bets.length === 0) {
      toast.error('Place at least one bet before spinning');
      return;
    }
    
    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    if (totalBetAmount > coins) {
      toast.error('Not enough coins for these bets');
      return;
    }
    
    setIsSpinning(true);
    setSpinResult(null);
    
    // Deduct bet amount from coins
    setCoins(prev => prev - totalBetAmount);
    
    // Generate a random number (0-37 for American roulette)
    const result = Math.floor(Math.random() * 38);
    
    // Simulate spinning animation
    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(result);
      
      // Calculate winnings
      let totalWinnings = 0;
      let isWin = false;
      
      bets.forEach(bet => {
        if (bet.numbers.includes(result)) {
          const winAmount = bet.amount * bet.payout;
          totalWinnings += winAmount + bet.amount; // Return bet amount plus winnings
          isWin = true;
        }
      });
      
      // Update history
      setHistory(prev => [{
        number: result,
        createdAt: new Date()
      }, ...prev]);
      
      // Update game result in database
      if (user) {
        updateGameResult(
          user,
          isWin,
          totalBetAmount,
          totalWinnings,
          bets,
          result,
          true, // isAmerican
          setCoins
        );
      } else {
        // If no user, just update UI
        if (totalWinnings > 0) {
          setCoins(prev => prev + totalWinnings);
        }
      }
      
      // Show result message
      if (totalWinnings > 0) {
        toast.success(`You won ${totalWinnings} coins!`);
      } else {
        toast.error('Better luck next time!');
      }
    }, 2000);
  };
  
  const handleNumberClick = (number: number) => {
    if (number >= 0) {
      // Direct number bet
      placeBet(BET_TYPES.STRAIGHT, [number], currentBetAmount, PAYOUTS.STRAIGHT);
    } else {
      // Outside bets
      switch (number) {
        case -1: // 1st dozen
          placeBet("1st Dozen", Array.from({ length: 12 }, (_, i) => i + 1), currentBetAmount, PAYOUTS.DOZEN);
          break;
        case -2: // 2nd dozen
          placeBet("2nd Dozen", Array.from({ length: 12 }, (_, i) => i + 13), currentBetAmount, PAYOUTS.DOZEN);
          break;
        case -3: // 3rd dozen
          placeBet("3rd Dozen", Array.from({ length: 12 }, (_, i) => i + 25), currentBetAmount, PAYOUTS.DOZEN);
          break;
        case -4: // 1-18
          placeBet(BET_TYPES.LOW, Array.from({ length: 18 }, (_, i) => i + 1), currentBetAmount, PAYOUTS.OUTSIDE);
          break;
        case -5: // Red
          placeBet(BET_TYPES.RED, [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36], currentBetAmount, PAYOUTS.OUTSIDE);
          break;
        case -6: // Even
          placeBet(BET_TYPES.EVEN, Array.from({ length: 18 }, (_, i) => (i + 1) * 2), currentBetAmount, PAYOUTS.OUTSIDE);
          break;
        case -7: // Odd
          placeBet(BET_TYPES.ODD, Array.from({ length: 18 }, (_, i) => (i * 2) + 1), currentBetAmount, PAYOUTS.OUTSIDE);
          break;
        case -8: // Black
          placeBet(BET_TYPES.BLACK, [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35], currentBetAmount, PAYOUTS.OUTSIDE);
          break;
        case -9: // 19-36
          placeBet(BET_TYPES.HIGH, Array.from({ length: 18 }, (_, i) => i + 19), currentBetAmount, PAYOUTS.OUTSIDE);
          break;
        case -10: // 1st column
          placeBet(BET_TYPES.COLUMN, [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34], currentBetAmount, PAYOUTS.COLUMN);
          break;
        case -11: // 2nd column
          placeBet(BET_TYPES.COLUMN, [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], currentBetAmount, PAYOUTS.COLUMN);
          break;
        case -12: // 3rd column
          placeBet(BET_TYPES.COLUMN, [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], currentBetAmount, PAYOUTS.COLUMN);
          break;
      }
    }
  };

  // Split bet handler
  const handleSplitBet = (numbers: number[]) => {
    if (numbers.length === 2) {
      placeBet(BET_TYPES.SPLIT, numbers, currentBetAmount, PAYOUTS.SPLIT);
    }
  };

  // Corner bet handler
  const handleCornerBet = (numbers: number[]) => {
    if (numbers.length === 4) {
      placeBet(BET_TYPES.CORNER, numbers, currentBetAmount, PAYOUTS.CORNER);
    }
  };

  // Line bet handler (six numbers)
  const handleLineBet = (numbers: number[]) => {
    if (numbers.length === 6) {
      placeBet(BET_TYPES.SIXLINE, numbers, currentBetAmount, PAYOUTS.SIXLINE);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="play">Play Game</TabsTrigger>
          <TabsTrigger value="history">Game History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="play" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-muted/30 rounded-full py-1 px-4 flex items-center gap-2">
                <Coins className="h-5 w-5 text-casino-gold" />
                <span className="text-lg font-bold text-casino-gold">{coins}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => decrementBet(5)} 
                  disabled={currentBetAmount <= MIN_BET || isSpinning}
                >-5</Button>
                
                <input 
                  type="number" 
                  value={currentBetAmount}
                  onChange={handleBetChange}
                  className="w-20 text-center bg-muted/30 border border-border/30 rounded px-2 py-1"
                  disabled={isSpinning}
                />
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => incrementBet(5)} 
                  disabled={currentBetAmount >= MAX_BET || isSpinning}
                >+5</Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => decrementBet(20)} 
                  disabled={currentBetAmount <= MIN_BET || isSpinning}
                >-20</Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => incrementBet(20)} 
                  disabled={currentBetAmount >= MAX_BET || isSpinning}
                >+20</Button>
              </div>
            </div>
            
            <Button 
              onClick={handleSpin} 
              disabled={isSpinning || bets.length === 0}
              className={`${isSpinning ? 'bg-muted' : 'bg-casino-gold hover:bg-casino-gold/90'} text-black`}
            >
              {isSpinning ? 'Spinning...' : 'Spin Wheel'}
            </Button>
          </div>
          
          <Card className="bg-card border border-border/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center">American Roulette</CardTitle>
              <CardDescription className="text-center">
                Place your bets on numbers or combinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Roulette Wheel Result */}
              {(isSpinning || spinResult !== null) && (
                <div className="flex justify-center mb-6">
                  {isSpinning ? (
                    <div className="animate-spin h-20 w-20 border-4 border-casino-gold border-t-transparent rounded-full"></div>
                  ) : (
                    <SpinResultDisplay spinResult={spinResult} isAmerican={true} />
                  )}
                </div>
              )}
              
              {/* Roulette Board - Using our updated component */}
              <RouletteBoard 
                isAmerican={true}
                onNumberClick={handleNumberClick}
                onSplitBet={handleSplitBet}
                onCornerBet={handleCornerBet}
                onLineBet={handleLineBet}
              />
              
              {/* Placed Bets */}
              <BetChips 
                bets={bets} 
                onClearBets={clearBets}
                gameType="American"
              />
              
              {/* Previous Results */}
              <RouletteHistory 
                history={history.slice(0, 10)} 
                isAmerican={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Game History</CardTitle>
              <CardDescription>Your recent American Roulette games</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No game history yet. Start playing to record your results!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left py-2">Time</th>
                        <th className="text-left py-2">Result</th>
                        <th className="text-right py-2">Bet Amount</th>
                        <th className="text-right py-2">Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((game, index) => (
                        <tr key={index} className="border-b border-border/10">
                          <td className="py-2">{format(game.createdAt, 'HH:mm:ss')}</td>
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div className={`${getNumberColor(game.number)} w-6 h-6 rounded-full flex items-center justify-center text-white text-xs`}>
                                {game.number === 37 ? '00' : game.number}
                              </div>
                              <span>
                                {game.number === 0 || game.number === 37 ? 'Green' : 
                                 game.number % 2 === 0 ? 'Black / Even' : 'Red / Odd'}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 text-right">
                            {/* Bet amount would be retrieved from game history */}
                          </td>
                          <td className="py-2 text-right">
                            {/* Win/Loss amount would be retrieved from game history */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AmericanRoulette;
