
import React from 'react';
import { Button } from "@/components/ui/button";
import { Award } from 'lucide-react';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onPlayAgain: () => void;
  onViewStats: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  onPlayAgain,
  onViewStats
}) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center mb-4">
        <Award className="h-12 w-12 text-casino-gold" />
      </div>
      <h3 className="text-xl font-bold mb-2">Quiz Complete!</h3>
      <p className="mb-6 text-muted-foreground">
        You answered {score > 0 ? "some" : "no"} questions correctly.
      </p>
      <div className="bg-muted/30 p-4 rounded-lg mb-6 w-full max-w-md">
        <h4 className="font-semibold mb-2">Your Results:</h4>
        <div className="flex justify-between items-center mb-2">
          <span>Total Score:</span>
          <span className="text-casino-gold font-bold">{score} coins</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Questions Answered:</span>
          <span>{totalQuestions}/{totalQuestions}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button 
          onClick={onPlayAgain} 
          className="casino-btn flex-1"
        >
          Play Again
        </Button>
        <Button 
          onClick={onViewStats} 
          className="flex-1"
          variant="outline"
        >
          View Statistics
        </Button>
      </div>
    </div>
  );
};

export default QuizResults;
