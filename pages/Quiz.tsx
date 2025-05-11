
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMultiplayer } from '@/context/MultiplayerContext';
import { getActiveTournaments, Tournament } from '@/services/tournaments';
import CurrencySelector from '@/components/CurrencySelector';

import CasinoQuiz from '@/components/games/CasinoQuiz';
import QuizStatistics from '@/components/games/QuizStatistics';
import QuizHeader from '@/components/quiz/QuizHeader';
import QuizTabs from '@/components/quiz/QuizTabs';
import QuizTournamentList from '@/components/quiz/QuizTournamentList';
import QuizLobby from '@/components/quiz/QuizLobby';
import { questions } from '@/components/quiz/quizQuestions';

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [coins, setCoins] = useState(1000);
  const { joinGame, leaveGame } = useMultiplayer();
  const [activeTab, setActiveTab] = useState<"play" | "stats" | "lobby" | "tournaments">("play");
  const [quizTournaments, setQuizTournaments] = useState<Tournament[]>([]);
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setCoins(data.balance);
        }
      }
    };
    
    fetchBalance();
    
    // Join the quiz game
    joinGame('Casino Quiz');
    
    // Get quiz tournaments
    const fetchTournaments = async () => {
      try {
        const tournaments = await getActiveTournaments();
        const quizTournamentsOnly = tournaments.filter(t => t.game === 'quiz');
        setQuizTournaments(quizTournamentsOnly);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        setQuizTournaments([]);
      }
    };
    
    fetchTournaments();
    
    // Cleanup when leaving the page
    return () => {
      leaveGame();
    };
  }, [user, joinGame, leaveGame]);

  const handleJoinTournament = (tournamentType: string) => {
    if (!user) {
      toast.error('You must be logged in to join tournaments');
      return;
    }

    toast.success(`You've joined the ${tournamentType} tournament!`, {
      description: 'Play quiz games to increase your rank on the leaderboard.'
    });

    setActiveTab('play');
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as "play" | "stats" | "lobby" | "tournaments");
  };
  
  return (
    <Layout>
      <div className="flex justify-between items-center">
        <QuizHeader title="Casino Quiz" />
        <CurrencySelector className="mb-6" />
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <QuizTabs activeTab={activeTab} onTabChange={handleTabChange} />
        
        <TabsContent value="play">
          <CasinoQuiz 
            questions={questions} 
            maxQuestions={10}
            timeLimit={30}
            onComplete={(score) => console.log(`Quiz completed with score: ${score}`)}
          />
        </TabsContent>
        
        <TabsContent value="stats">
          <QuizStatistics />
        </TabsContent>
        
        <TabsContent value="tournaments">
          <QuizTournamentList 
            tournaments={quizTournaments}
            onJoinTournament={handleJoinTournament}
          />
        </TabsContent>
        
        <TabsContent value="lobby">
          <QuizLobby />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Quiz;
