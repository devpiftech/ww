
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Check, Coins, Dices, X } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Json } from '@/integrations/supabase/types';

interface CasinoDiceProps {
  user: User | null;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

interface GameHistory {
  time: Date;
  bet: number;
  selectedNumber: number;
  diceResults: number[];
  won: boolean;
  payout: number;
}

interface GameData {
  selected_number: number;
  dice_results: number[];
}

const CasinoDice: React.FC<CasinoDiceProps> = ({ user, coins, setCoins }) => {
  const [bet, setBet] = useState(10);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResults, setDiceResults] = useState<number[]>([1, 1]);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const minBet = 5;
  const maxBet = Math.min(1000, coins);
  const possibleNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Sum of two dice (2-12)
  
  // Calculate payout multiplier based on probability
  const getPayoutMultiplier = (number: number): number => {
    // The multiplier is higher for less likely numbers
    const probabilities: { [key: number]: number } = {
      2: 30, // 1/36 chance, pays 30x
      3: 15, // 2/36 chance, pays 15x
      4: 10, // 3/36 chance, pays 10x
      5: 8, // 4/36 chance, pays 8x
      6: 6, // 5/36 chance, pays 6x
      7: 5, // 6/36 chance, pays 5x
      8: 6, // 5/36 chance, pays 6x
      9: 8, // 4/36 chance, pays 8x
      10: 10, // 3/36 chance, pays 10x
      11: 15, // 2/36 chance, pays 15x
      12: 30, // 1/36 chance, pays 30x
    };
    
    return probabilities[number] || 1;
  };
  
  // Start a new game
  const startGame = () => {
    if (coins < bet) {
      toast.error('Not enough coins!');
      return;
    }
    
    if (selectedNumber === null) {
      toast.error('Please select a number first!');
      return;
    }
    
    setIsPlaying(true);
    setIsRolling(true);
    setDiceResults([1, 1]);
    setGameResult(null);
    
    // Simulate rolling dice
    setTimeout(() => {
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      const sum = die1 + die2;
      
      setDiceResults([die1, die2]);
      
      // Determine if the player won
      const isWin = selectedNumber === sum;
      
      // Calculate payout based on the selected number
      const multiplier = getPayoutMultiplier(selectedNumber);
      const payout = isWin ? bet * multiplier : 0;
      
      // Update game result
      setGameResult(isWin ? 'win' : 'loss');
      
      // Update database and local state
      if (user) {
        updateGameResult(isWin, payout, { selected_number: selectedNumber, dice_results: [die1, die2] });
      }
      
      // Update coins locally
      const netGain = isWin ? payout - bet : -bet;
      setCoins(prevCoins => prevCoins + netGain);
      
      setIsRolling(false);
      
      // Show appropriate toast
      if (isWin) {
        toast.success(`Congratulations! You won ${payout} coins!`);
      } else {
        toast.error(`Not lucky this time. Try again!`);
      }
    }, 2000);
  };
  
  // Update game result in the database
  const updateGameResult = async (isWin: boolean, payout: number, gameData: GameData) => {
    try {
      if (!user) return;
      
      // Update user balance
      await supabase.rpc('update_balance', {
        user_uuid: user.id,
        amount: isWin ? payout - bet : -bet,
        t_type: isWin ? 'win' : 'loss',
        game_name: 'dice',
        meta: { bet_amount: bet, payout: payout }
      });
      
      // Convert GameData to Json type for proper typing with Supabase
      const gameDataJson: Json = {
        selected_number: gameData.selected_number,
        dice_results: gameData.dice_results
      };
      
      // Record game result
      await supabase.from('game_results').insert({
        user_id: user.id,
        game: 'dice',
        bet_amount: bet,
        win_amount: payout,
        is_win: isWin,
        game_data: gameDataJson
      });
      
      // Add to history
      setHistory(prev => [{
        time: new Date(),
        bet: bet,
        selectedNumber: gameData.selected_number,
        diceResults: gameData.dice_results,
        won: isWin,
        payout: payout
      }, ...prev]);
      
    } catch (error) {
      console.error('Error updating game result:', error);
      toast.error('Failed to update game result');
    }
  };
  
  // Load game history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', user.id)
        .eq('game', 'dice')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setIsLoading(false);
      
      if (error) {
        console.error('Error fetching game history:', error);
        return;
      }
      
      if (data) {
        const history = data.map(item => {
          let selectedNumber = 0;
          let diceResults: number[] = [1, 1];
          
          if (item.game_data && 
              typeof item.game_data === 'object' && 
              !Array.isArray(item.game_data) &&
              'selected_number' in item.game_data &&
              'dice_results' in item.game_data) {
            selectedNumber = Number(item.game_data.selected_number);
            diceResults = Array.isArray(item.game_data.dice_results) 
              ? item.game_data.dice_results.map(Number) 
              : [1, 1];
          }
          
          return {
            time: new Date(item.created_at),
            bet: item.bet_amount,
            selectedNumber: selectedNumber,
            diceResults: diceResults,
            won: item.is_win,
            payout: item.win_amount
          };
        });
        
        setHistory(history);
      }
    };
    
    fetchHistory();
  }, [user]);
  
  // Handle bet input change
  const handleBetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value);
    
    if (isNaN(value)) {
      setBet(minBet);
      return;
    }
    
    if (value < minBet) value = minBet;
    if (value > maxBet) value = maxBet;
    
    setBet(value);
  };
  
  const incrementBet = (amount: number) => {
    setBet(prev => Math.min(maxBet, prev + amount));
  };
  
  const decrementBet = (amount: number) => {
    setBet(prev => Math.max(minBet, prev - amount));
  };
  
  // Reset game for a new round
  const playAgain = () => {
    setIsPlaying(false);
    setDiceResults([1, 1]);
    setGameResult(null);
  };

  // Render dice face
  const renderDieFace = (value: number) => {
    const dotPositions: { [key: number]: string[] } = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };
    
    const positions = dotPositions[value] || [];
    
    return (
      <div className="bg-white h-16 w-16 md:h-20 md:w-20 rounded-lg border-2 border-casino-gold/50 relative shadow-md">
        {positions.map((position, index) => {
          let positionClass = 'absolute h-3 w-3 bg-black rounded-full';
          
          switch (position) {
            case 'center':
              positionClass += ' top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
              break;
            case 'top-left':
              positionClass += ' top-2 left-2';
              break;
            case 'top-right':
              positionClass += ' top-2 right-2';
              break;
            case 'middle-left':
              positionClass += ' top-1/2 left-2 -translate-y-1/2';
              break;
            case 'middle-right':
              positionClass += ' top-1/2 right-2 -translate-y-1/2';
              break;
            case 'bottom-left':
              positionClass += ' bottom-2 left-2';
              break;
            case 'bottom-right':
              positionClass += ' bottom-2 right-2';
              break;
          }
          
          return <div key={index} className={positionClass}></div>;
        })}
      </div>
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="play" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="play">Play Game</TabsTrigger>
          <TabsTrigger value="history">Game History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="play" className="space-y-4">
          <div className="flex items-center justify-between">
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
                  disabled={bet <= minBet || isPlaying}
                >-5</Button>
                
                <Input 
                  type="number" 
                  value={bet}
                  onChange={handleBetChange}
                  className="w-20 text-center"
                  disabled={isPlaying}
                />
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => incrementBet(5)} 
                  disabled={bet >= maxBet || isPlaying}
                >+5</Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => decrementBet(50)} 
                  disabled={bet <= minBet || isPlaying}
                >-50</Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => incrementBet(50)} 
                  disabled={bet >= maxBet || isPlaying}
                >+50</Button>
              </div>
            </div>
            
            <Button 
              onClick={startGame} 
              disabled={isPlaying || coins < bet || selectedNumber === null}
              className="bg-casino-gold hover:bg-casino-gold/90 text-black"
            >
              Roll Dice
            </Button>
          </div>
          
          <Card className="bg-card border border-border/30 shadow-xl mt-8">
            <CardHeader>
              <CardTitle className="text-center">Casino Dice</CardTitle>
              <CardDescription className="text-center">
                Guess the sum of two dice and win big! Higher payouts for less likely numbers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isPlaying ? (
                <div className="space-y-6">
                  <div className="text-center text-lg">Select the sum you think the dice will show:</div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-w-md mx-auto">
                    {possibleNumbers.map(num => (
                      <Button
                        key={num}
                        variant={selectedNumber === num ? "default" : "outline"}
                        className={`h-12 text-xl ${selectedNumber === num ? "bg-casino-gold text-black hover:text-black hover:bg-casino-gold/90" : ""}`}
                        onClick={() => setSelectedNumber(num)}
                      >
                        {num} ({getPayoutMultiplier(num)}x)
                      </Button>
                    ))}
                  </div>
                  
                  {selectedNumber && (
                    <div className="text-center mt-4">
                      <p>You selected: <span className="font-bold">{selectedNumber}</span></p>
                      <p className="text-sm text-muted-foreground">
                        Win pays {getPayoutMultiplier(selectedNumber)}x your bet
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="mb-6">
                    <div className="text-center mb-2">You bet on a sum of:</div>
                    <div className="h-16 w-16 rounded-full bg-casino-gold text-black text-2xl flex items-center justify-center font-bold">
                      {selectedNumber}
                    </div>
                  </div>
                  
                  {isRolling ? (
                    <div className="space-y-4">
                      <div className="flex justify-center gap-4">
                        <div className="animate-bounce delay-100 bg-white h-16 w-16 md:h-20 md:w-20 rounded-lg border-2 border-casino-gold/50 flex items-center justify-center text-2xl">
                          ?
                        </div>
                        <div className="animate-bounce delay-300 bg-white h-16 w-16 md:h-20 md:w-20 rounded-lg border-2 border-casino-gold/50 flex items-center justify-center text-2xl">
                          ?
                        </div>
                      </div>
                      <div className="text-center text-xl animate-pulse mt-4">
                        Rolling dice...
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center gap-4">
                        {renderDieFace(diceResults[0])}
                        {renderDieFace(diceResults[1])}
                      </div>
                      
                      <div className="text-center text-2xl font-bold mt-4 animate-scale-in">
                        Sum: {diceResults[0] + diceResults[1]}
                      </div>
                      
                      <div className="mt-4 text-center">
                        {gameResult === 'win' ? (
                          <div className="text-green-500 text-xl flex items-center gap-2 justify-center">
                            <Check className="h-5 w-5" /> 
                            Win! +{bet * getPayoutMultiplier(selectedNumber || 0)} coins
                          </div>
                        ) : (
                          <div className="text-red-500 text-xl flex items-center gap-2 justify-center">
                            <X className="h-5 w-5" /> 
                            Not lucky this time
                          </div>
                        )}
                        
                        <Button onClick={playAgain} className="mt-4">
                          Play Again
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Game History</CardTitle>
              <CardDescription>Your recent Casino Dice games</CardDescription>
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
                        <th className="text-left py-2">Bet</th>
                        <th className="text-left py-2">Your Number</th>
                        <th className="text-left py-2">Dice Result</th>
                        <th className="text-left py-2">Game Result</th>
                        <th className="text-right py-2">Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((game, index) => (
                        <tr key={index} className="border-b border-border/10">
                          <td className="py-2">{format(game.time, 'HH:mm:ss')}</td>
                          <td className="py-2">{game.bet}</td>
                          <td className="py-2">{game.selectedNumber}</td>
                          <td className="py-2">
                            {game.diceResults[0] + game.diceResults[1]} 
                            <span className="text-sm text-muted-foreground ml-1">
                              ({game.diceResults[0]},{game.diceResults[1]})
                            </span>
                          </td>
                          <td className="py-2">
                            {game.won ? (
                              <span className="text-green-500 flex items-center gap-1">
                                <Check className="h-4 w-4" /> Win
                              </span>
                            ) : (
                              <span className="text-red-500 flex items-center gap-1">
                                <X className="h-4 w-4" /> Loss
                              </span>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            {game.won ? (
                              <span className="text-green-500">+{game.payout}</span>
                            ) : (
                              <span className="text-red-500">-{game.bet}</span>
                            )}
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

export default CasinoDice;
