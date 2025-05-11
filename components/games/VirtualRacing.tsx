
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Coins, Trophy, X } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Json } from '@/integrations/supabase/types';

interface VirtualRacingProps {
  user: User | null;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

interface Competitor {
  id: number;
  name: string;
  odds: number;
  position: number;
  color: string;
  icon: string;
}

interface GameHistory {
  time: Date;
  bet: number;
  selectedCompetitor: number;
  winner: number;
  won: boolean;
  payout: number;
}

interface GameData {
  selected_competitor: number;
  winner: number;
}

const VirtualRacing: React.FC<VirtualRacingProps> = ({ user, coins, setCoins }) => {
  const [bet, setBet] = useState(10);
  const [selectedCompetitor, setSelectedCompetitor] = useState<number | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const raceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const minBet = 5;
  const maxBet = Math.min(1000, coins);
  const raceLength = 100;
  const maxPosition = 95;
  
  // Initialize competitors
  useEffect(() => {
    const initialCompetitors: Competitor[] = [
      { id: 1, name: "Speedy", odds: 2.5, position: 0, color: "bg-red-500", icon: "🐎" },
      { id: 2, name: "Thunder", odds: 3.0, position: 0, color: "bg-blue-500", icon: "🐎" },
      { id: 3, name: "Flash", odds: 4.0, position: 0, color: "bg-green-500", icon: "🐎" },
      { id: 4, name: "Blitz", odds: 5.5, position: 0, color: "bg-yellow-500", icon: "🐎" },
      { id: 5, name: "Rocket", odds: 7.0, position: 0, color: "bg-purple-500", icon: "🐎" },
    ];
    setCompetitors(initialCompetitors);
  }, []);
  
  // Start a race
  const startRace = () => {
    if (coins < bet) {
      toast.error('Not enough coins!');
      return;
    }
    
    if (selectedCompetitor === null) {
      toast.error('Please select a competitor first!');
      return;
    }
    
    setIsRacing(true);
    setGameResult(null);
    setWinner(null);
    
    // Reset positions
    setCompetitors(prev => 
      prev.map(competitor => ({
        ...competitor,
        position: 0
      }))
    );
    
    // Deduct bet amount
    setCoins(prev => prev - bet);
    
    // Determine the winner in advance (weighted by odds)
    const competitorsWithWeights = competitors.map(c => {
      // Lower odds (favorites) get higher weight
      const weight = 10 / c.odds;
      return { id: c.id, weight };
    });
    
    const totalWeight = competitorsWithWeights.reduce((sum, c) => sum + c.weight, 0);
    let random = Math.random() * totalWeight;
    let winnerId = 1; // Default
    
    for (const c of competitorsWithWeights) {
      if (random < c.weight) {
        winnerId = c.id;
        break;
      }
      random -= c.weight;
    }
    
    // Simulate the race
    if (raceIntervalRef.current) {
      clearInterval(raceIntervalRef.current);
    }
    
    raceIntervalRef.current = setInterval(() => {
      let someoneFinished = false;
      
      setCompetitors(prev => {
        const updated = prev.map(competitor => {
          // Calculate speed - the winner moves slightly faster on average
          let speed = Math.random() * 3;
          if (competitor.id === winnerId) {
            speed += Math.random() * 0.5; // Slight advantage
          }
          
          // Ensure the winner finishes first
          const newPosition = Math.min(
            competitor.position + speed,
            competitor.id === winnerId ? maxPosition : maxPosition - 0.1
          );
          
          if (newPosition >= maxPosition) {
            someoneFinished = true;
          }
          
          return {
            ...competitor,
            position: newPosition
          };
        });
        
        return updated;
      });
      
      // Check if race is finished
      if (someoneFinished) {
        if (raceIntervalRef.current) {
          clearInterval(raceIntervalRef.current);
          raceIntervalRef.current = null;
        }
        
        // End race after a slight delay to show the winner crossing the line
        setTimeout(() => {
          finishRace(winnerId);
        }, 500);
      }
    }, 100);
  };
  
  // Finish the race and determine results
  const finishRace = (winnerId: number) => {
    setIsRacing(false);
    setWinner(winnerId);
    
    const isWin = selectedCompetitor === winnerId;
    setGameResult(isWin ? 'win' : 'loss');
    
    // Calculate payout
    const winner = competitors.find(c => c.id === winnerId);
    const payout = isWin ? Math.round(bet * (winner?.odds || 1)) : 0;
    
    // Update database and local state
    if (user) {
      updateGameResult(isWin, payout, { selected_competitor: selectedCompetitor, winner: winnerId });
    }
    
    // Update coins locally
    if (isWin) {
      setCoins(prevCoins => prevCoins + payout);
    }
    
    // Show appropriate toast
    if (isWin) {
      toast.success(`Congratulations! Your horse won ${payout} coins!`);
    } else {
      toast.error(`Your horse didn't win this time.`);
    }
  };
  
  // Update game result in the database
  const updateGameResult = async (isWin: boolean, payout: number, gameData: GameData) => {
    try {
      if (!user) return;
      
      // Update user balance
      await supabase.rpc('update_balance', {
        user_uuid: user.id,
        amount: isWin ? payout : 0, // Already deducted the bet amount when starting the race
        t_type: isWin ? 'win' : 'loss',
        game_name: 'racing',
        meta: { bet_amount: bet, payout: payout }
      });
      
      // Convert GameData to Json type for proper typing with Supabase
      const gameDataJson: Json = {
        selected_competitor: gameData.selected_competitor,
        winner: gameData.winner
      };
      
      // Record game result
      await supabase.from('game_results').insert({
        user_id: user.id,
        game: 'racing',
        bet_amount: bet,
        win_amount: payout,
        is_win: isWin,
        game_data: gameDataJson
      });
      
      // Add to history
      setHistory(prev => [{
        time: new Date(),
        bet: bet,
        selectedCompetitor: gameData.selected_competitor,
        winner: gameData.winner,
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
        .eq('game', 'racing')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setIsLoading(false);
      
      if (error) {
        console.error('Error fetching game history:', error);
        return;
      }
      
      if (data) {
        const history = data.map(item => {
          let selectedCompetitor = 0;
          let winner = 0;
          
          if (item.game_data && 
              typeof item.game_data === 'object' && 
              !Array.isArray(item.game_data) &&
              'selected_competitor' in item.game_data &&
              'winner' in item.game_data) {
            selectedCompetitor = Number(item.game_data.selected_competitor);
            winner = Number(item.game_data.winner);
          }
          
          return {
            time: new Date(item.created_at),
            bet: item.bet_amount,
            selectedCompetitor: selectedCompetitor,
            winner: winner,
            won: item.is_win,
            payout: item.win_amount
          };
        });
        
        setHistory(history);
      }
    };
    
    fetchHistory();
  }, [user]);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (raceIntervalRef.current) {
        clearInterval(raceIntervalRef.current);
      }
    };
  }, []);
  
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
  
  // Reset game for a new race
  const playAgain = () => {
    setSelectedCompetitor(null);
    setGameResult(null);
    setWinner(null);
    setCompetitors(prev => 
      prev.map(competitor => ({
        ...competitor,
        position: 0
      }))
    );
  };
  
  // Get competitor name by id
  const getCompetitorName = (id: number) => {
    return competitors.find(c => c.id === id)?.name || `Competitor ${id}`;
  };
  
  // Get competitor odds by id
  const getCompetitorOdds = (id: number) => {
    return competitors.find(c => c.id === id)?.odds || 1;
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="play" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="play">Play Game</TabsTrigger>
          <TabsTrigger value="history">Race History</TabsTrigger>
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
                  disabled={bet <= minBet || isRacing}
                >-5</Button>
                
                <input 
                  type="number" 
                  value={bet}
                  onChange={handleBetChange}
                  className="w-20 text-center bg-muted/30 border border-border/30 rounded px-2 py-1"
                  disabled={isRacing}
                />
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => incrementBet(5)} 
                  disabled={bet >= maxBet || isRacing}
                >+5</Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => decrementBet(50)} 
                  disabled={bet <= minBet || isRacing}
                >-50</Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => incrementBet(50)} 
                  disabled={bet >= maxBet || isRacing}
                >+50</Button>
              </div>
            </div>
            
            <Button 
              onClick={startRace} 
              disabled={isRacing || coins < bet || selectedCompetitor === null}
              className="bg-casino-gold hover:bg-casino-gold/90 text-black"
            >
              Start Race
            </Button>
          </div>
          
          <Card className="bg-card border border-border/30 shadow-xl mt-8">
            <CardHeader>
              <CardTitle className="text-center">Virtual Racing</CardTitle>
              <CardDescription className="text-center">
                Pick your competitor and watch the race unfold!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Race Track */}
              <div className="relative w-full h-[300px] bg-green-900/50 rounded-lg mb-6 overflow-hidden">
                {/* Finish Line */}
                <div className="absolute top-0 bottom-0 right-12 w-1 bg-white z-10 flex flex-col">
                  <div className="flex-1 bg-white"></div>
                  <div className="flex-1 bg-black"></div>
                  <div className="flex-1 bg-white"></div>
                  <div className="flex-1 bg-black"></div>
                  <div className="flex-1 bg-white"></div>
                  <div className="flex-1 bg-black"></div>
                </div>
                
                {/* Lanes */}
                {competitors.map((competitor, index) => (
                  <div 
                    key={competitor.id} 
                    className="absolute w-full h-[50px] border-t border-white/20"
                    style={{ top: `${index * 60}px` }}
                  >
                    {/* Lane number */}
                    <div className="absolute left-2 top-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">
                      {competitor.id}
                    </div>
                    
                    {/* Competitor */}
                    <div 
                      className={`absolute top-1 h-12 transition-all duration-100 text-3xl flex items-center`}
                      style={{ 
                        left: `${competitor.position}%`,
                        transform: `translateX(-50%)`,
                      }}
                    >
                      {competitor.icon}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Competitor Selection */}
              <div className="space-y-4">
                <h3 className="text-center text-lg font-medium">
                  {winner ? 'Race Results' : 'Choose Your Competitor'}
                </h3>
                
                <div className="grid gap-2">
                  {competitors.map(competitor => (
                    <div 
                      key={competitor.id} 
                      className={`
                        p-3 rounded-md border cursor-pointer transition-all
                        ${selectedCompetitor === competitor.id ? 
                          'border-casino-gold bg-casino-gold/10' : 
                          'border-border/30 hover:border-border'
                        }
                        ${winner === competitor.id ? 'bg-green-500/20 border-green-500' : ''}
                      `}
                      onClick={() => !isRacing && !winner && setSelectedCompetitor(competitor.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{competitor.icon}</span>
                          <div>
                            <div className="font-medium">{competitor.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Odds: {competitor.odds}x
                            </div>
                          </div>
                        </div>
                        
                        {selectedCompetitor === competitor.id && (
                          <div className="bg-casino-gold/80 text-black px-2 py-1 rounded text-sm">
                            Your Pick
                          </div>
                        )}
                        
                        {winner === competitor.id && (
                          <div className="flex items-center gap-1 text-green-500">
                            <Trophy className="h-4 w-4" />
                            Winner
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {gameResult && (
                  <div className="mt-6 text-center">
                    {gameResult === 'win' ? (
                      <div className="text-green-500 text-xl flex items-center gap-2 justify-center">
                        <Trophy className="h-5 w-5" /> 
                        You won! +{Math.round(bet * getCompetitorOdds(selectedCompetitor || 1))} coins
                      </div>
                    ) : (
                      <div className="text-red-500 text-xl flex items-center gap-2 justify-center">
                        <X className="h-5 w-5" /> 
                        Your competitor didn't win
                      </div>
                    )}
                    
                    <Button onClick={playAgain} className="mt-4">
                      New Race
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Race History</CardTitle>
              <CardDescription>Your recent Virtual Racing games</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No race history yet. Start playing to record your results!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left py-2">Time</th>
                        <th className="text-left py-2">Bet</th>
                        <th className="text-left py-2">Your Pick</th>
                        <th className="text-left py-2">Winner</th>
                        <th className="text-left py-2">Race Result</th>
                        <th className="text-right py-2">Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((race, index) => (
                        <tr key={index} className="border-b border-border/10">
                          <td className="py-2">{format(race.time, 'HH:mm:ss')}</td>
                          <td className="py-2">{race.bet}</td>
                          <td className="py-2">{getCompetitorName(race.selectedCompetitor)}</td>
                          <td className="py-2">{getCompetitorName(race.winner)}</td>
                          <td className="py-2">
                            {race.won ? (
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
                            {race.won ? (
                              <span className="text-green-500">+{race.payout}</span>
                            ) : (
                              <span className="text-red-500">-{race.bet}</span>
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

export default VirtualRacing;
