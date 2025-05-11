
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Coins, Rotate3D, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CoinTossProps {
  user: User | null;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

// Define proper types for game data
interface GameData {
  selected_side: string;
  result: string;
}

interface GameHistoryItem {
  time: Date;
  bet: number;
  selectedSide: string;
  result: string;
  won: boolean;
  payout: number;
}

const CoinToss: React.FC<CoinTossProps> = ({ user, coins, setCoins }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [winStreak, setWinStreak] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      loadGameHistory();
    }
  }, [user]);
  
  const loadGameHistory = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('game_results')
      .select('*')
      .eq('user_id', user.id)
      .eq('game', 'cointoss')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error('Error loading game history:', error);
      return;
    }
    
    if (data) {
      const history = data.map(item => {
        // Safely access game_data properties with proper type checking and assertion
        let selectedSide = '';
        let resultValue = '';
        
        // Only try to access properties if game_data is an object with the required properties
        if (item.game_data && 
            typeof item.game_data === 'object' && 
            !Array.isArray(item.game_data) &&
            'selected_side' in item.game_data &&
            'result' in item.game_data) {
          selectedSide = String(item.game_data.selected_side);
          resultValue = String(item.game_data.result);
        }
        
        return {
          time: new Date(item.created_at),
          bet: item.bet_amount,
          selectedSide: selectedSide,
          result: resultValue,
          won: item.is_win,
          payout: item.win_amount
        };
      });
      
      setGameHistory(history);
      
      // Calculate win streak
      let streak = 0;
      for (const game of history) {
        if (game.won) {
          streak++;
        } else {
          break;
        }
      }
      setWinStreak(streak);
    }
  };
  
  const flipCoin = async () => {
    if (!user) {
      toast.error("Please sign in to play", {
        description: "You need to be logged in to place bets"
      });
      navigate('/auth');
      return;
    }
    
    if (betAmount <= 0) {
      toast.error("Invalid bet amount", {
        description: "Please enter a valid bet amount"
      });
      return;
    }
    
    if (betAmount > coins) {
      toast.error("Not enough coins", {
        description: "You don't have enough coins for this bet"
      });
      return;
    }
    
    setIsAnimating(true);
    
    // Simulate coin flip animation
    setTimeout(async () => {
      // Determine result (50-50 chance)
      const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
      setResult(coinResult);
      
      const isWin = coinResult === selectedSide;
      const payoutAmount = isWin ? betAmount : 0;
      const balanceChange = isWin ? betAmount : -betAmount;
      
      // Record game result
      const gameData = {
        selected_side: selectedSide,
        result: coinResult
      };
      
      // Update database
      try {
        const { data: updateResult, error: updateError } = await supabase.rpc(
          'update_balance',
          {
            user_uuid: user.id,
            amount: balanceChange,
            t_type: isWin ? 'win' : 'loss',
            game_name: 'cointoss',
            meta: gameData
          }
        );
        
        if (updateError) throw updateError;
        
        // Record game result
        await supabase.from('game_results').insert({
          user_id: user.id,
          game: 'cointoss',
          bet_amount: betAmount,
          win_amount: payoutAmount,
          is_win: isWin,
          game_data: gameData
        });
        
        // Update coins state
        setCoins(prevCoins => prevCoins + balanceChange);
        
        // Update game history
        const newGameEntry = {
          time: new Date(),
          bet: betAmount,
          selectedSide,
          result: coinResult,
          won: isWin,
          payout: payoutAmount
        };
        
        setGameHistory(prevHistory => [newGameEntry, ...prevHistory]);
        
        if (isWin) {
          setWinStreak(prev => prev + 1);
          toast.success(`You won ${payoutAmount} coins!`, {
            description: `The coin landed on ${coinResult} - your choice was correct!`
          });
        } else {
          setWinStreak(0);
          toast.error(`You lost ${betAmount} coins`, {
            description: `The coin landed on ${coinResult} - better luck next time!`
          });
        }
        
      } catch (error) {
        console.error("Error recording game result:", error);
        toast.error("Error updating balance", {
          description: "There was a problem updating your balance. Please try again."
        });
      }
      
      setIsAnimating(false);
      
    }, 2000);
  };
  
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBetAmount(isNaN(value) ? 0 : value);
  };
  
  const quickBet = (amount: number) => {
    setBetAmount(amount);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="play" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="play">Play Game</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="play" className="space-y-6">
          {/* Coin display */}
          <div className="flex flex-col items-center justify-center py-6">
            <div 
              className={`w-48 h-48 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 border-4 border-yellow-600 shadow-xl flex items-center justify-center mb-6 overflow-hidden
                ${isAnimating ? 'animate-flip' : ''} 
                ${result && !isAnimating ? 'scale-110 transition-transform' : ''}`}
            >
              {!isAnimating && result ? (
                <div className="text-6xl font-bold text-yellow-800">
                  {result === 'heads' ? 'H' : 'T'}
                </div>
              ) : (
                <div className="text-4xl font-bold text-yellow-800 animate-pulse">
                  ?
                </div>
              )}
            </div>
            
            {winStreak >= 3 && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 mb-4 animate-pulse">
                <Trophy size={16} /> {winStreak} Win Streak! 🔥
              </div>
            )}
            
            <h3 className="text-xl font-semibold mb-4">Choose your side:</h3>
            <div className="flex gap-4 mb-6">
              <Button 
                variant={selectedSide === 'heads' ? 'default' : 'outline'} 
                className={selectedSide === 'heads' ? 'bg-casino-gold text-black' : ''}
                onClick={() => setSelectedSide('heads')}
                disabled={isAnimating}
              >
                Heads
              </Button>
              
              <Button 
                variant={selectedSide === 'tails' ? 'default' : 'outline'}
                className={selectedSide === 'tails' ? 'bg-casino-gold text-black' : ''}
                onClick={() => setSelectedSide('tails')}
                disabled={isAnimating}
              >
                Tails
              </Button>
            </div>
          </div>
          
          {/* Betting controls */}
          <Card>
            <CardHeader>
              <CardTitle>Place Your Bet</CardTitle>
              <CardDescription>Choose an amount to bet on {selectedSide}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Coins className="h-5 w-5 text-casino-gold" />
                <Input
                  type="number"
                  value={betAmount}
                  onChange={handleBetChange}
                  min={1}
                  max={coins}
                  className="text-right"
                  disabled={isAnimating}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" onClick={() => quickBet(10)} disabled={isAnimating}>10</Button>
                <Button variant="outline" onClick={() => quickBet(25)} disabled={isAnimating}>25</Button>
                <Button variant="outline" onClick={() => quickBet(50)} disabled={isAnimating}>50</Button>
                <Button variant="outline" onClick={() => quickBet(100)} disabled={isAnimating}>100</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full casino-btn" 
                onClick={flipCoin} 
                disabled={isAnimating || betAmount <= 0 || betAmount > coins}
              >
                {isAnimating ? (
                  <>
                    <Rotate3D className="mr-2 h-4 w-4 animate-spin" />
                    Flipping...
                  </>
                ) : (
                  'Flip Coin'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Game History</CardTitle>
              <CardDescription>Your recent coin toss results</CardDescription>
            </CardHeader>
            <CardContent>
              {gameHistory.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No game history yet. Start playing to see your results!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Time</th>
                        <th className="text-left py-2">Bet</th>
                        <th className="text-left py-2">Choice</th>
                        <th className="text-left py-2">Result</th>
                        <th className="text-right py-2">Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameHistory.map((game, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{game.time.toLocaleTimeString()}</td>
                          <td className="py-2">{game.bet}</td>
                          <td className="py-2 capitalize">{game.selectedSide}</td>
                          <td className="py-2 capitalize">{game.result}</td>
                          <td className={`py-2 text-right ${game.won ? 'text-green-500' : 'text-red-500'}`}>
                            {game.won ? `+${game.payout}` : `-${game.bet}`}
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
      
      {/* How to play */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Select either Heads or Tails as your prediction.</li>
            <li>Enter the amount of coins you want to bet.</li>
            <li>Click the "Flip Coin" button to start the game.</li>
            <li>If the coin lands on your selected side, you win the amount you bet!</li>
            <li>If it lands on the other side, you lose your bet.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinToss;

// Add a CSS animation for the coin flip
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes flip {
    0% {
      transform: rotateY(0);
    }
    100% {
      transform: rotateY(1800deg);
    }
  }
  
  .animate-flip {
    animation: flip 2s ease-in-out;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 1.5s infinite alternate;
  }
  
  @keyframes pulse-glow {
    0% {
      filter: drop-shadow(0 0 0.5rem gold);
    }
    100% {
      filter: drop-shadow(0 0 1rem gold);
    }
  }
`;
document.head.appendChild(styleSheet);
