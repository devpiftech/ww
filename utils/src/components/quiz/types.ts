
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizProps {
  user: any;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}
