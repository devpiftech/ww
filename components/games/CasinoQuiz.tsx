
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import QuizScoreDisplay from '@/components/quiz/QuizScoreDisplay';
import QuizResults from '@/components/quiz/QuizResults';
import { QuizQuestion as QuizQuestionType } from '@/components/quiz/types';
import { useAuth } from '@/context/AuthContext';
import { processGameRound } from '@/services/GameStateService';
import { recordGameResult } from '@/services/gameResults';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { startBotSimulation } from '@/services/bots';
import { getCurrentTournament } from '@/services/tournaments/tournamentActions';
import { BotSimulationConfig } from '@/services/types/supabaseTypes';
import { useQuizGame } from '@/hooks/quiz/useQuizGame';

interface CasinoQuizProps {
  questions?: QuizQuestionType[];
  maxQuestions?: number;
  timeLimit?: number;
  onComplete?: (score: number) => void;
}

const CasinoQuiz: React.FC<CasinoQuizProps> = ({
  questions = [],
  maxQuestions = 10,
  timeLimit = 20,
  onComplete
}) => {
  // Initialize quiz game with provided questions
  const { user } = useAuth();
  const [coins, setCoins] = useState(1000);
  const [quizResult, setQuizResult] = useState<'win' | 'lose' | null>(null);
  
  // Use our hook with the correct props
  const {
    currentQuestionIndex,
    selectedAnswer,
    isAnswered,
    score,
    timeLeft,
    quizStarted,
    quizFinished,
    quizQuestions,
    isLoading,
    getQuestionReward,
    startQuiz,
    handleAnswer,
    handleNextQuestion
  } = useQuizGame({
    user,
    coins,
    setCoins,
    questions,
    quizBet: 10,
  });

  useEffect(() => {
    // If quiz is finished, process the result
    if (quizFinished) {
      processQuizResult();
      
      // Start bot simulation to make the leaderboard more interesting
      const botConfig: BotSimulationConfig = {
        id: 'quiz-bots',
        enabled: true,
        bot_count: 8,
        min_bet: 5,
        max_bet: 50, 
        min_wait: 10000,
        max_wait: 30000,
        games: ['quiz'],
        created_at: new Date().toISOString(),
        minBots: 3,
        maxBots: 8,
        joinFrequency: 45000,
        chatFrequency: 60000,
        leaveFrequency: 90000
      };
      
      startBotSimulation(botConfig);
    }
  }, [quizFinished]);

  useEffect(() => {
    // Auto-check for active tournaments
    const checkForTournaments = async () => {
      const activeTournamentId = await getCurrentTournament('quiz');
      if (activeTournamentId) {
        console.log(`Active quiz tournament found: ${activeTournamentId}`);
      }
    };
    
    checkForTournaments();
  }, []);

  // Process the quiz result
  const processQuizResult = async () => {
    if (!user) {
      toast.error('You need to be logged in to save your score');
      return;
    }
    
    // Win if score is above 70%
    const correctAnswers = quizQuestions.filter((_, index) => 
      index < currentQuestionIndex && quizQuestions[index].correctAnswer === selectedAnswer
    ).length;
    
    const isWin = score >= Math.floor(maxQuestions * 0.7);
    setQuizResult(isWin ? 'win' : 'lose');
    
    // Calculate winnings - base of 50 coins per correct answer if they win
    const betAmount = 100; // Fixed bet for quiz game
    const winAmount = isWin ? score * 50 : 0;
    
    // Process the game round
    const success = await processGameRound(
      user,
      'quiz',
      betAmount,
      winAmount,
      isWin,
      {
        score,
        correct: correctAnswers,
        wrong: maxQuestions - correctAnswers,
        unanswered: 0,
        time_taken: timeLimit * maxQuestions - timeLeft,
        max_questions: maxQuestions
      }
    );
    
    if (success) {
      if (isWin) {
        toast.success(`You won ${winAmount} coins!`);
      } else {
        toast.error(`Better luck next time. You lost ${betAmount} coins.`);
      }
    }
    
    // Call the onComplete callback if provided
    if (onComplete) {
      onComplete(score);
    }
  };

  const handleStartGame = () => {
    if (!user) {
      toast.error('You need to be logged in to play');
      return;
    }
    
    startQuiz();
    setQuizResult(null);
  };
  
  const handlePlayAgain = () => {
    setQuizResult(null);
    setTimeout(() => {
      startQuiz();
    }, 500);
  };

  const currentQuestion = quizStarted && !quizFinished && currentQuestionIndex < quizQuestions.length 
    ? quizQuestions[currentQuestionIndex] 
    : null;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Casino Quiz Challenge</CardTitle>
      </CardHeader>
      <CardContent>
        {!quizStarted && (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4">Quiz Challenge</h2>
            <p className="mb-6">Answer questions correctly to win coins!</p>
            <p className="mb-2">• The bet is 100 coins</p>
            <p className="mb-2">• You must answer at least 70% correctly to win</p>
            <p className="mb-2">• Each correct answer is worth 50 coins</p>
            <p className="mb-6">• You have {timeLimit} seconds per question</p>
            <Button size="lg" onClick={handleStartGame}>Start Quiz</Button>
          </div>
        )}
        
        {quizStarted && !quizFinished && currentQuestion && (
          <div>
            <QuizScoreDisplay 
              score={score} 
              currentQuestionDifficulty={currentQuestion.difficulty}
              getQuestionReward={getQuestionReward}
            />
            
            <QuizQuestion
              currentQuestion={currentQuestion}
              timeLeft={timeLeft}
              isAnswered={isAnswered}
              selectedAnswer={selectedAnswer}
              onAnswer={handleAnswer}
              onNext={handleNextQuestion}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={maxQuestions}
              getQuestionReward={getQuestionReward}
            />
          </div>
        )}
        
        {quizFinished && (
          <QuizResults
            score={score}
            totalQuestions={maxQuestions}
            onPlayAgain={handlePlayAgain}
            onViewStats={() => console.log("View stats")}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CasinoQuiz;
