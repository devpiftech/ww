
import React from 'react';

interface QuizScoreDisplayProps {
  score: number;
  currentQuestionDifficulty: 'easy' | 'medium' | 'hard';
  getQuestionReward: (difficulty: 'easy' | 'medium' | 'hard') => number;
}

const QuizScoreDisplay: React.FC<QuizScoreDisplayProps> = ({
  score,
  currentQuestionDifficulty,
  getQuestionReward
}) => {
  return (
    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg mb-6">
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">Current Score</span>
        <span className="font-bold text-casino-gold">{score} coins</span>
      </div>
      <div className="text-right">
        <span className="text-sm text-muted-foreground block">Reward for Current Question</span>
        <span className="font-bold text-casino-gold">
          +{getQuestionReward(currentQuestionDifficulty)} coins
        </span>
      </div>
    </div>
  );
};

export default QuizScoreDisplay;
