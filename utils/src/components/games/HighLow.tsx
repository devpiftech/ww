
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ArrowDown, ArrowUp, Check, Coins, Trophy, X } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Json } from '@/integrations/supabase/types';

interface HighLowProps {
  user: User | null;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

interface GameHistory {
  time: Date;
  bet: number;
  previousCard: number;
  newCard: number;
  guess: 'higher' | 'lower';
  won: boolean;
  payout: number;
}

interface GameData {
  previous_card: number;
  new_card: number;
  guess: 'higher' | 'lower';
  double_or_nothing?: boolean;
}

const HighLow: React.FC<HighLowProps> = ({ user, coins, setCoins }) => {
  const [bet, setBet] = useState(10);
  const [currentCard, setCurrentCard] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [nextCard, setNextCard] = useState<number | null>(null);
  const [guess, setGuess] = useState<'higher' | 'lower' | null>(null);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [doubleOrNothing, setDoubleOrNothing] = useState(false);
  const [currentWinnings, setCurrentWinnings] = useState(0);
  const [consecutiveWins, setConsecutiveWins] = useState(0);

  const minBet = 5;
  const maxBet = Math.min(1000, coins);
  
  // Generate a random card number between 1 and 13
  const getRandomCard = () => Math.floor(Math.random() * 13) + 1;
  
  // Format card number to display (J, Q, K, A)
  const formatCard = (cardNum: number): string => {
    if (cardNum === 1) return 'A';
    if (cardNum === 11) return 'J';
    if (cardNum === 12) return 'Q';
    if (cardNum === 13) return 'K';
    return cardNum.toString();
  };
  
  // Start a new game
  const startGame = () => {
    if (coins < bet) {
      toast.error('Not enough coins!');
      return;
    }
    
    const initialCard = getRandomCard();
    setCurrentCard(initialCard);
    setNextCard(null);
    setGuess(null);
    setGameResult(null);
    setIsPlaying(true);
    setIsRevealing(false);
    setDoubleOrNothing(false);
    setCurrentWinnings(0);
  };
  
  // Make a guess (higher or lower)
  const makeGuess = (guessType: 'higher' | 'lower') => {
    if (!currentCard || !isPlaying) return;
    
    setGuess(guessType);
    const newCard = getRandomCard();
    setNextCard(newCard);
    setIsRevealing(true);
    
    // Determine if the player won
    let isWin = false;
    if (guessType === 'higher' && newCard > currentCard) {
      isWin = true;
    } else if (guessType === 'lower' && newCard < currentCard) {
      isWin = true;
    }
    
    // Calculate payout
    const currentBet = doubleOrNothing ? currentWinnings : bet;
    const payout = isWin ? currentBet * 2 : 0;
    
    // Update game result
    setGameResult(isWin ? 'win' : 'loss');
    
    // Update database and local state
    if (user) {
      updateGameResult(isWin, payout, { 
        previous_card: currentCard, 
        new_card: newCard, 
        guess: guessType,
        double_or_nothing: doubleOrNothing
      });
    }
    
    if (isWin) {
      setCurrentWinnings(payout);
      setConsecutiveWins(prev => prev + 1);
      // Don't update coins yet - wait for user to decide to take winnings or double down
    } else {
      // If player loses, deduct bet or lose current winnings
      const lossAmount = doubleOrNothing ? currentWinnings : bet;
      setCoins(prevCoins => prevCoins - (doubleOrNothing ? 0 : bet));
      setConsecutiveWins(0);
      setCurrentWinnings(0);
    }
    
    setTimeout(() => {
      setIsRevealing(false);
    }, 1500);
  };

  // Handle "Take Winnings" action
  const takeWinnings = () => {
    if (currentWinnings > 0) {
      setCoins(prevCoins => prevCoins + currentWinnings);
      toast.success(`You collected ${currentWinnings} coins!`);
      resetGame();
    }
  };

  // Handle "Double or Nothing" action
  const playDoubleOrNothing = () => {
    if (currentWinnings > 0) {
      setDoubleOrNothing(true);
      setCurrentCard(nextCard);
      setNextCard(null);
      setGuess(null);
      setGameResult(null);
    }
  };
  
  // Update game result in the database
  const updateGameResult = async (isWin: boolean, payout: number, gameData: GameData) => {
    try {
      if (!user) return;
      
      // Update user balance only if taking winnings (not when continuing with double or nothing)
      if (isWin && !doubleOrNothing) {
        // Don't update balance yet, wait for user to decide
      } else if (!isWin && !doubleOrNothing) {
        // If loss on regular bet
        await supabase.rpc('update_balance', {
          user_uuid: user.id,
          amount: -bet,
          t_type: 'loss',
          game_name: 'highlow',
          meta: { bet_amount: bet, payout: 0 }
        });
      }
      
      // Convert GameData to Json type for proper typing with Supabase
      const gameDataJson: Json = {
        previous_card: gameData.previous_card,
        new_card: gameData.new_card,
        guess: gameData.guess,
        double_or_nothing: gameData.double_or_nothing || false
      };
      
      // Record game result
      await supabase.from('game_results').insert({
        user_id: user.id,
        game: 'highlow',
        bet_amount: doubleOrNothing ? currentWinnings / 2 : bet,
        win_amount: isWin ? payout : 0,
        is_win: isWin,
        game_data: gameDataJson
      });
      
      // Add to history
      setHistory(prev => [{
        time: new Date(),
        bet: doubleOrNothing ? currentWinnings / 2 : bet,
        previousCard: gameData.previous_card,
        newCard: gameData.new_card,
        guess: gameData.guess,
        won: isWin,
        payout: payout
      }, ...prev]);
      
    } catch (error) {
      console.error('Error updating game result:', error);
      toast.error('Failed to update game result');
    }
  };
  
  // Reset the game state to start a new round
  const resetGame = () => {
    setIsPlaying(false);
    setCurrentCard(null);
    setNextCard(null);
    setGuess(null);
    setGameResult(null);
    setDoubleOrNothing(false);
    setConsecutiveWins(0);
    setCurrentWinnings(0);
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
        .eq('game', 'highlow')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setIsLoading(false);
      
      if (error) {
        console.error('Error fetching game history:', error);
        return;
      }
      
      if (data) {
        const history = data.map(item => {
          let previousCard = 0;
          let newCard = 0;
          let guessValue: 'higher' | 'lower' = 'higher';
          
          if (item.game_data && 
              typeof item.game_data === 'object' && 
              !Array.isArray(item.game_data) &&
              'previous_card' in item.game_data &&
              'new_card' in item.game_data &&
              'guess' in item.game_data) {
            previousCard = Number(item.game_data.previous_card);
            newCard = Number(item.game_data.new_card);
            guessValue = item.game_data.guess as 'higher' | 'lower';
          }
          
          return {
            time: new Date(item.created_at),
            bet: item.bet_amount,
            previousCard: previousCard,
            newCard: newCard,
            guess: guessValue,
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
              
              {!isPlaying && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => decrementBet(5)} 
                    disabled={bet <= minBet}
                  >-5</Button>
                  
                  <Input 
                    type="number" 
                    value={bet}
                    onChange={handleBetChange}
                    className="w-20 text-center"
                  />
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => incrementBet(5)} 
                    disabled={bet >= maxBet}
                  >+5</Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => decrementBet(50)} 
                    disabled={bet <= minBet}
                  >-50</Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => incrementBet(50)} 
                    disabled={bet >= maxBet}
                  >+50</Button>
                </div>
              )}
            </div>
            
            {!isPlaying ? (
              <Button 
                onClick={startGame} 
                disabled={coins < bet}
                className="bg-casino-gold hover:bg-casino-gold/90 text-black"
              >
                Deal Card
              </Button>
            ) : gameResult === 'win' ? (
              <div className="flex gap-2">
                <span className="self-center mr-2">
                  Current Streak: <span className="text-green-500 font-bold">{consecutiveWins}</span>
                </span>
                <Button 
                  onClick={takeWinnings}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Take {currentWinnings} Coins
                </Button>
                <Button 
                  onClick={playDoubleOrNothing}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Double or Nothing
                </Button>
              </div>
            ) : gameResult === 'loss' ? (
              <Button 
                onClick={resetGame}
                className="bg-blue-600 hover:bg-blue-700"
              >
                New Game
              </Button>
            ) : null}
          </div>
          
          {currentWinnings > 0 && gameResult === 'win' && (
            <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-lg text-center mb-4">
              <div className="text-green-400 font-bold text-xl mb-2">
                You won {currentWinnings} coins!
              </div>
              <p className="text-sm text-green-300/80">
                Take your winnings or risk them for double or nothing!
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <Card className="bg-card border border-border/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center">Current Card</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {currentCard !== null ? (
                  <div className="playing-card">
                    <div className="text-6xl font-bold text-center my-8">
                      {formatCard(currentCard)}
                    </div>
                  </div>
                ) : (
                  <div className="text-2xl text-muted-foreground">
                    Deal to start
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center">Make Your Guess</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center gap-4">
                {isPlaying && !isRevealing && !gameResult ? (
                  <div className="flex flex-col gap-4 w-full">
                    <Button 
                      onClick={() => makeGuess('higher')}
                      className="flex items-center justify-center gap-2 py-8"
                      variant="outline"
                    >
                      <ArrowUp className="h-6 w-6" />
                      <span className="text-xl">Higher</span>
                    </Button>
                    
                    <Button 
                      onClick={() => makeGuess('lower')}
                      className="flex items-center justify-center gap-2 py-8" 
                      variant="outline"
                    >
                      <ArrowDown className="h-6 w-6" />
                      <span className="text-xl">Lower</span>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    {isRevealing ? (
                      <div className="animate-pulse">Revealing...</div>
                    ) : gameResult ? (
                      <div className="flex flex-col items-center gap-2">
                        <div>You guessed {guess}</div>
                        {gameResult === 'win' ? (
                          <div className="text-green-500 text-2xl flex items-center gap-2">
                            <Check className="h-6 w-6" /> Win!
                          </div>
                        ) : (
                          <div className="text-red-500 text-2xl flex items-center gap-2">
                            <X className="h-6 w-6" /> Loss
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>Deal to start</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center">Next Card</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {nextCard !== null ? (
                  <div className={`playing-card ${isRevealing ? 'animate-flip-in' : ''}`}>
                    <div className="text-6xl font-bold text-center my-8">
                      {formatCard(nextCard)}
                    </div>
                  </div>
                ) : (
                  <div className="text-2xl text-muted-foreground">
                    {isPlaying ? "Make a guess" : "Deal to start"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Game History</CardTitle>
              <CardDescription>Your recent High-Low games</CardDescription>
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
                        <th className="text-left py-2">Cards</th>
                        <th className="text-left py-2">Guess</th>
                        <th className="text-left py-2">Result</th>
                        <th className="text-right py-2">Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((game, index) => (
                        <tr key={index} className="border-b border-border/10">
                          <td className="py-2">{format(game.time, 'HH:mm:ss')}</td>
                          <td className="py-2">{game.bet}</td>
                          <td className="py-2">{formatCard(game.previousCard)} → {formatCard(game.newCard)}</td>
                          <td className="py-2 capitalize">{game.guess}</td>
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

export default HighLow;
