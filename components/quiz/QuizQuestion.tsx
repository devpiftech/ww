
import React from 'react';
import { Button } from "@/components/ui/button";
import { QuizQuestion as QuizQuestionType } from './types';
import { Progress } from "@/components/ui/progress";
import { Check, X } from 'lucide-react';

interface QuizQuestionProps {
  currentQuestion: QuizQuestionType;
  timeLeft: number;
  isAnswered: boolean;
  selectedAnswer: number | null;
  onAnswer: (optionIndex: number) => void;
  onNext: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
  getQuestionReward: (difficulty: 'easy' | 'medium' | 'hard') => number;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  currentQuestion,
  timeLeft,
  isAnswered,
  selectedAnswer,
  onAnswer,
  onNext,
  currentQuestionIndex,
  totalQuestions,
  getQuestionReward
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </div>
        <div className="px-3 py-1 bg-muted/30 rounded-full text-sm font-semibold">
          {currentQuestion.difficulty.toUpperCase()}
        </div>
      </div>

      <div>
        <Progress value={(timeLeft / 30) * 100} className="h-2 mb-1" />
        <div className="text-sm text-right">Time left: {timeLeft}s</div>
      </div>

      <div className="bg-muted/20 p-4 rounded-lg">
        <h3 className="text-xl font-medium mb-6">{currentQuestion.question}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.correctAnswer;
            const isSelected = selectedAnswer === index;
            
            let buttonClass = "w-full justify-start text-left px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors";
            
            if (isAnswered) {
              if (isCorrect) {
                buttonClass = "w-full justify-start text-left px-4 py-3 bg-green-500/20 text-green-500 border border-green-500";
              } else if (isSelected) {
                buttonClass = "w-full justify-start text-left px-4 py-3 bg-red-500/20 text-red-500 border border-red-500";
              }
            }
            
            return (
              <Button
                key={index}
                className={buttonClass}
                onClick={() => !isAnswered && onAnswer(index)}
                disabled={isAnswered}
              >
                <div className="flex items-center w-full">
                  <span className="flex-1">{option}</span>
                  {isAnswered && isCorrect && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <Button onClick={onNext} className="w-full">
          {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      )}
    </div>
  );
};

export default QuizQuestion;
