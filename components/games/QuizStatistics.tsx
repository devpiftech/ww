
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, HelpCircle, Activity, TrendingUp, Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface QuizStats {
  total_games: number;
  total_correct: number;
  total_incorrect: number;
  accuracy: number;
  average_score: number;
  highest_score: number;
  total_coins_won: number;
  total_coins_spent: number;
  profit: number;
  most_difficult_question: string;
  easiest_question: string;
  best_category: string;
}

const defaultStats: QuizStats = {
  total_games: 0,
  total_correct: 0,
  total_incorrect: 0,
  accuracy: 0,
  average_score: 0,
  highest_score: 0,
  total_coins_won: 0,
  total_coins_spent: 0,
  profit: 0,
  most_difficult_question: 'N/A',
  easiest_question: 'N/A',
  best_category: 'N/A'
};

const QuizStatistics: React.FC = () => {
  const [stats, setStats] = useState<QuizStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchQuizStats = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch quiz game results
        const { data: quizGames, error } = await supabase
          .from('game_results')
          .select('*')
          .eq('user_id', user.id)
          .eq('game', 'quiz')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (!quizGames || quizGames.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Calculate statistics
        let totalCorrect = 0;
        let totalQuestions = 0;
        let totalCoinsWon = 0;
        let totalCoinsSpent = 0;
        let highScore = 0;
        
        quizGames.forEach(game => {
          const gameData = game.game_data || {};
          
          // Track coin flow
          totalCoinsWon += game.win_amount || 0;
          totalCoinsSpent += game.bet_amount || 0;
          
          // Track questions - safely access game_data properties
          if (gameData && typeof gameData === 'object' && 'correct_answers' in gameData) {
            totalCorrect += Number(gameData.correct_answers) || 0;
          }
          
          if (gameData && typeof gameData === 'object' && 'total_questions' in gameData) {
            totalQuestions += Number(gameData.total_questions) || 0;
          }
          
          // Track high score
          if ((game.win_amount || 0) > highScore) {
            highScore = game.win_amount || 0;
          }
        });
        
        // Calculate derived statistics
        const avgScore = quizGames.length > 0 ? Math.floor(totalCoinsWon / quizGames.length) : 0;
        const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
        const profit = totalCoinsWon - totalCoinsSpent;
        
        setStats({
          total_games: quizGames.length,
          total_correct: totalCorrect,
          total_incorrect: totalQuestions - totalCorrect,
          accuracy,
          average_score: avgScore,
          highest_score: highScore,
          total_coins_won: totalCoinsWon,
          total_coins_spent: totalCoinsSpent,
          profit,
          most_difficult_question: 'Analysis not available',
          easiest_question: 'Analysis not available',
          best_category: 'Analysis not available'
        });
        
      } catch (error) {
        console.error('Error fetching quiz statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizStats();
  }, [user]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Statistics</CardTitle>
          <CardDescription>Loading your quiz statistics...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <div className="animate-pulse flex flex-col items-center gap-4 w-full">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-casino-gold" />
          Quiz Statistics
        </CardTitle>
        <CardDescription>
          Your performance in Casino Quiz games
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-casino-gold" />
                    Quiz Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Total Games:</span>
                        <span className="font-bold">{stats.total_games}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Correct Answers:</span>
                        <span className="font-bold">{stats.total_correct}</span>
                      </div>
                      <Progress value={stats.accuracy} className="h-2" />
                      <div className="flex justify-end mt-1">
                        <span className="text-xs text-muted-foreground">{stats.accuracy.toFixed(1)}% Accuracy</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-casino-gold" />
                    Score Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-background/50 p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground mb-1">Average</div>
                        <div className="font-bold text-lg text-casino-gold">{stats.average_score}</div>
                      </div>
                      <div className="bg-background/50 p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground mb-1">Highest</div>
                        <div className="font-bold text-lg text-casino-gold">{stats.highest_score}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Accuracy</Badge>
                    <span>{stats.accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.accuracy} className="w-1/2 h-2" />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Questions</Badge>
                    <span>{stats.total_correct} / {stats.total_correct + stats.total_incorrect}</span>
                  </div>
                  <Progress 
                    value={stats.total_correct / (stats.total_correct + stats.total_incorrect || 1) * 100} 
                    className="w-1/2 h-2" 
                  />
                </div>
              </div>
              
              {stats.total_games === 0 ? (
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <HelpCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    No quiz games played yet. Play some games to see your statistics.
                  </p>
                </div>
              ) : null}
            </div>
          </TabsContent>
          
          <TabsContent value="earnings" className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`bg-muted/30 border-l-4 ${stats.profit >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Net Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`font-bold text-lg ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stats.profit >= 0 ? '+' : ''}{stats.profit} coins
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Total Won</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-bold text-lg text-casino-gold">
                      {stats.total_coins_won} coins
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-bold text-lg">
                      {stats.total_coins_spent} coins
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 px-4">
        {stats.total_games === 0 ? (
          <div className="w-full p-3 bg-muted/30 rounded-lg text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-casino-gold opacity-70" />
            <p className="text-sm text-muted-foreground">
              Play Casino Quiz games to build your statistics and improve your ranking!
            </p>
          </div>
        ) : (
          <div className="w-full p-3 bg-muted/30 rounded-lg text-center">
            <span className="text-xs text-muted-foreground">
              Statistics based on your last {stats.total_games} quiz games
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizStatistics;
