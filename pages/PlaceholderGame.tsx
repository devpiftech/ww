import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Construction, Dices, Users } from 'lucide-react';
import { toast } from 'sonner';
import Blackjack from '@/components/games/Blackjack';
import CoinToss from '@/components/games/CoinToss';
import HighLow from '@/components/games/HighLow';
import LuckyNumber from '@/components/games/LuckyNumber';
import CasinoDice from '@/components/games/CasinoDice';
import VirtualRacing from '@/components/games/VirtualRacing';
import EuropeanRoulette from '@/components/games/EuropeanRoulette';
import AmericanRoulette from '@/components/games/AmericanRoulette';
import CasinoQuiz from '@/components/games/CasinoQuiz';
import VideoPoker from '@/components/games/VideoPoker';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMultiplayer } from '@/context/MultiplayerContext';
import OnlinePlayers from '@/components/multiplayer/OnlinePlayers';
import GameLobby from '@/components/multiplayer/GameLobby';
import CurrencySelector from '@/components/CurrencySelector';
import { QuizQuestion } from '@/components/quiz/types';
import { questions } from '@/components/quiz/quizQuestions';

interface PlaceholderGameProps {
  title: string;
}

const PlaceholderGame: React.FC<PlaceholderGameProps> = ({ title }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [coins, setCoins] = useState(1000);
  const location = useLocation();
  const { joinGame, leaveGame } = useMultiplayer();
  const [showLobby, setShowLobby] = useState(true);
  
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
    
    // Join the game lobby
    const gameName = title;
    joinGame(gameName);
    
    // Cleanup when leaving the page
    return () => {
      leaveGame();
    };
  }, [user, title, joinGame, leaveGame]);
  
  const handleFeedback = () => {
    toast.success("Thank you for your interest!", {
      description: "We'll notify you when this game is ready to play!"
    });
  };

  const handleStartGame = () => {
    setShowLobby(false);
    toast.success(`Starting ${title}`, {
      description: "Good luck and have fun!"
    });
  };

  // Render appropriate game based on path
  const renderGameContent = () => {
    if (showLobby) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GameLobby 
              gameName={title}
              onStartGame={handleStartGame}
              showChat={true}
            />
          </div>
          <div>
            <OnlinePlayers
              showGame={true}
              showCount={true}
            />
          </div>
        </div>
      );
    }
    
    if (location.pathname === '/blackjack') {
      return <Blackjack user={user} coins={coins} setCoins={setCoins} />;
    } else if (location.pathname === '/cointoss') {
      return <CoinToss user={user} coins={coins} setCoins={setCoins} />;
    } else if (location.pathname === '/highlow') {
      return <HighLow user={user} coins={coins} setCoins={setCoins} />;
    } else if (location.pathname === '/picknumber') {
      return <LuckyNumber user={user} coins={coins} setCoins={setCoins} />;
    } else if (location.pathname === '/dice') {
      return <CasinoDice user={user} coins={coins} setCoins={setCoins} />;
    } else if (location.pathname === '/racing') {
      return <VirtualRacing user={user} coins={coins} setCoins={setCoins} />;
    } else if (location.pathname === '/roulette-eu') {
      return <EuropeanRoulette user={user} coins={coins} setCoins={setCoins} isAmerican={false} />;
    } else if (location.pathname === '/roulette-us') {
      return <AmericanRoulette user={user} coins={coins} setCoins={setCoins} isAmerican={true} />;
    } else if (location.pathname === '/quiz') {
      return <CasinoQuiz 
        questions={questions} 
        maxQuestions={10}
        timeLimit={30}
        onComplete={(score) => console.log(`Quiz completed with score: ${score}`)}
      />;
    } else if (location.pathname === '/poker') {
      return <VideoPoker user={user} coins={coins} setCoins={setCoins} />;
    }
    
    // For all other games, show placeholder
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="max-w-2xl w-full p-8 text-center border border-casino-gold/20">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
              <Construction className="h-12 w-12 text-casino-gold animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Coming Soon!</h2>
          <p className="text-muted-foreground mb-8">
            We're working hard to bring you an amazing {title} experience. 
            Please check back soon!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/games')}>
              <Dices className="mr-2 h-4 w-4" />
              Browse Other Games
            </Button>
            <Button variant="outline" onClick={handleFeedback}>
              Get Notified When Ready
            </Button>
          </div>
        </Card>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2" 
            onClick={() => navigate('/games')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <CurrencySelector />
          
          {showLobby && (
            <Button 
              variant="default"
              onClick={handleStartGame}
              className="casino-btn"
            >
              Start Game
            </Button>
          )}
          {!showLobby && (
            <Button 
              variant="outline"
              onClick={() => setShowLobby(true)}
            >
              <Users className="mr-2 h-4 w-4" />
              Back to Lobby
            </Button>
          )}
        </div>
      </div>
      
      {renderGameContent()}
    </Layout>
  );
};

export default PlaceholderGame;
