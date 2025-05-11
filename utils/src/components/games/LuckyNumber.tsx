import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Check, Coins, Trophy, X } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Json } from '@/integrations/supabase/types';

interface LuckyNumberProps {
  user: User | null;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

interface GameHistory {
  time: Date;
  bet: number;
  selectedNumber: number;
  result: number;
  won: boolean;
  payout: number;
}

interface GameData {
  selected_number: number;
  result: number;
}

const LuckyNumber: React.FC<LuckyNumberProps> = ({ user, coins, setCoins }) => {
  const [bet, setBet] = useState(10);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const minBet = 5;
  const maxBet = Math.min(1000, coins);
  const maxNumber = 10; // Numbers 1-10
  
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
    setIsRevealing(true);
    setResult(null);
    setGameResult(null);
    
    // Simulate drawing a number
    setTimeout(() => {
      const drawnNumber = Math.floor(Math.random() * maxNumber) + 1;
      setResult(drawnNumber);
      
      // Determine if the player won
      const isWin = selectedNumber === drawnNumber;
      
      // Calculate payout (10x for a correct guess)
      const payout = isWin ? bet * 10 : 0;
      
      // Update game result
      setGameResult(isWin ? 'win' : 'loss');
      
      // Update database and local state
      if (user) {
        updateGameResult(isWin, payout, { selected_number: selectedNumber, result: drawnNumber });
      }
      
      // Update coins locally
      const netGain = isWin ? payout - bet : -bet;
      setCoins(prevCoins => prevCoins + netGain);
      
      setIsRevealing(false);
      
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
        game_name: 'picknumber',
        meta: { bet_amount: bet, payout: payout }
      });
      
      // Convert GameData to Json type for proper typing with Supabase
      const gameDataJson: Json = {
        selected_number: gameData.selected_number,
        result: gameData.result
      };
      
      // Record game result
      await supabase.from('game_results').insert({
        user_id: user.id,
        game: 'picknumber',
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
        result: gameData.result,
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
        .eq('game', 'picknumber')
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
          let resultNumber = 0;
          
          if (item.game_data && 
              typeof item.game_data === 'object' && 
              !Array.isArray(item.game_data) &&
              'selected_number' in item.game_data &&
              'result' in item.game_data) {
            selectedNumber = Number(item.game_data.selected_number);
            resultNumber = Number(item.game_data.result);
          }
          
          return {
            time: new Date(item.created_at),
            bet: item.bet_amount,
            selectedNumber: selectedNumber,
            result: resultNumber,
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
    setResult(null);
    setGameResult(null);
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
              Play Now
            </Button>
          </div>
          
          <Card className="bg-card border border-border/30 shadow-xl mt-8">
            <CardHeader>
              <CardTitle className="text-center">Pick Your Lucky Number (1-{maxNumber})</CardTitle>
              <CardDescription className="text-center">
                Pick the correct number and win 10x your bet!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isPlaying ? (
                <div className="grid grid-cols-5 gap-4 max-w-md mx-auto">
                  {Array.from({ length: maxNumber }, (_, i) => i + 1).map(num => (
                    <Button
                      key={num}
                      variant={selectedNumber === num ? "default" : "outline"}
                      className={`h-16 text-xl ${selectedNumber === num ? "bg-casino-gold text-black hover:text-black hover:bg-casino-gold/90" : ""}`}
                      onClick={() => setSelectedNumber(num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="mb-6">
                    <div className="text-center mb-2">You selected:</div>
                    <div className="h-20 w-20 rounded-full bg-casino-gold text-black text-3xl flex items-center justify-center font-bold">
                      {selectedNumber}
                    </div>
                  </div>
                  
                  {isRevealing ? (
                    <div className="animate-pulse text-xl">Drawing a number...</div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="text-center mb-2">Result:</div>
                      <div className="h-24 w-24 rounded-full border-4 border-white text-4xl flex items-center justify-center font-bold animate-scale-in">
                        {result}
                      </div>
                      
                      <div className="mt-8 text-center">
                        {gameResult === 'win' ? (
                          <div className="text-green-500 text-2xl flex items-center gap-2 justify-center">
                            <Trophy className="h-6 w-6" /> Win! +{bet * 10} coins
                          </div>
                        ) : (
                          <div className="text-red-500 text-xl flex items-center gap-2 justify-center">
                            <X className="h-5 w-5" /> Not lucky this time
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
              <CardDescription>Your recent Lucky Number games</CardDescription>
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
                        <th className="text-left py-2">Result</th>
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
                          <td className="py-2">{game.result}</td>
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

export default LuckyNumber;
