import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QuizQuestion } from '@/components/quiz/types';

interface UseQuizGameProps {
  user?: any;
  coins?: number;
  setCoins?: React.Dispatch<React.SetStateAction<number>>;
  questions: QuizQuestion[];
  quizBet: number;
  multiplayerMode?: boolean;
  matchId?: string | null;
}

export const useQuizGame = ({
  user, 
  coins, 
  setCoins, 
  questions,
  quizBet,
  multiplayerMode = false,
  matchId = null
}: UseQuizGameProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Configure rewards based on difficulty
  const getQuestionReward = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    switch (difficulty) {
      case 'easy': return quizBet;
      case 'medium': return quizBet * 2;
      case 'hard': return quizBet * 3;
      default: return quizBet;
    }
  };

  // Update user balance
  const updateBalance = async (amount: number) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('update_balance', {
        user_uuid: user.id,
        amount: amount,
        t_type: 'quiz_game',
        game_name: 'quiz',
        meta: { quiz_score: score, questions_answered: currentQuestionIndex + 1 }
      });
      
      if (error) throw error;
      
      setCoins(prev => prev + amount);
      return data;
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  };

  // Save quiz game results
  const saveQuizResults = async (
    isWin: boolean, 
    betAmount: number, 
    winAmount: number, 
    correctAnswers: number, 
    totalQuestions: number
  ) => {
    if (!user) return;
    
    try {
      await supabase.from('game_results').insert({
        user_id: user.id,
        game: 'quiz',
        bet_amount: betAmount,
        win_amount: winAmount,
        is_win: isWin,
        game_data: {
          multiplayer: multiplayerMode,
          match_id: matchId,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          difficulty_breakdown: {
            easy: quizQuestions.filter(q => q.difficulty === 'easy').length,
            medium: quizQuestions.filter(q => q.difficulty === 'medium').length,
            hard: quizQuestions.filter(q => q.difficulty === 'hard').length
          }
        }
      });
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  // Start the quiz
  const startQuiz = async (isSinglePlayer = true) => {
    // If user, coins, and setCoins are provided, check if user has enough coins
    if (user && coins !== undefined && setCoins && coins < quizBet * 5) {
      toast.error(`Not enough coins! You need at least ${quizBet * 5} coins to play.`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Only deduct coins if user, coins, and setCoins are provided
      if (user && coins !== undefined && setCoins) {
        await updateBalance(-quizBet * 5);
      }
      
      // Get 5 random questions
      const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random()).slice(0, 5);
      setQuizQuestions(shuffledQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizStarted(true);
      setQuizFinished(false);
      setTimeLeft(30);
      setIsAnswered(false);
      setSelectedAnswer(null);
      
      if (!isSinglePlayer) {
        toast.success('Multiplayer quiz started!', {
          description: 'Playing with other players'
        });
      }
    } catch (error) {
      console.error("Failed to start quiz:", error);
      toast.error("Failed to start quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle answering a question
  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      const reward = getQuestionReward(currentQuestion.difficulty);
      setScore(prev => prev + reward);
      toast.success(`Correct! +${reward} coins`);
    } else {
      toast.error("Incorrect answer!");
    }
  };
  
  // Move to the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      // Quiz finished
      finishQuiz();
    }
  };
  
  // End the quiz and update rewards
  const finishQuiz = async () => {
    setQuizFinished(true);
    
    // Calculate how many questions were answered correctly
    const correctAnswers = quizQuestions.reduce((count, question, index) => {
      const userAnswer = index < currentQuestionIndex || (index === currentQuestionIndex && isAnswered) 
        ? selectedAnswer 
        : null;
      return count + (userAnswer === question.correctAnswer ? 1 : 0);
    }, 0);
    
    // Calculate win rate
    const totalAnswered = currentQuestionIndex + (isAnswered ? 1 : 0);
    const winRate = totalAnswered > 0 ? correctAnswers / totalAnswered : 0;
    
    // Save game results only if user is provided
    if (user) {
      await saveQuizResults(
        score > 0,
        quizBet * 5,
        score,
        correctAnswers,
        quizQuestions.length
      );
    
      if (score > 0 && setCoins) {
        try {
          await updateBalance(score);
          
          // Different messages based on win rate
          if (winRate >= 0.8) {
            toast.success(`Excellent! You won ${score} coins!`, {
              description: `You answered ${correctAnswers} out of ${totalAnswered} questions correctly.`
            });
          } else if (winRate >= 0.5) {
            toast.success(`Good job! You won ${score} coins!`, {
              description: `You answered ${correctAnswers} out of ${totalAnswered} questions correctly.`
            });
          } else {
            toast.success(`Quiz completed! You won ${score} coins!`, {
              description: `Your final score: ${score}`
            });
          }
        } catch (error) {
          console.error("Failed to update balance at end of quiz:", error);
          toast.error("Failed to process your winnings. Please contact support.");
        }
      } else {
        toast.info("Quiz completed! Better luck next time!", {
          description: "You didn't win any coins this round."
        });
      }
    } else {
      toast.info("Quiz completed!", {
        description: `You got ${correctAnswers} out of ${totalAnswered} questions correct.`
      });
    }
  };

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (quizStarted && !quizFinished && !isAnswered && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer as NodeJS.Timeout);
            setIsAnswered(true);
            setSelectedAnswer(null);
            toast.error("Time's up!");
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStarted, quizFinished, isAnswered, timeLeft]);

  return {
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
    handleNextQuestion,
    setQuizStarted,
    setQuizFinished
  };
};
