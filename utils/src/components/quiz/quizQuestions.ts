
import { QuizQuestion } from './types';

export const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "What's the name of the betting system where you double your bet after each loss?",
    options: ["Martingale System", "Paroli System", "D'Alembert System", "Fibonacci System"],
    correctAnswer: 0,
    explanation: "The Martingale System involves doubling your bet after each loss, with the aim to recover all previous losses plus win a profit equal to the original stake.",
    difficulty: 'easy'
  },
  {
    id: 2,
    question: "In Blackjack, what is the value of an Ace?",
    options: ["1 only", "11 only", "5", "1 or 11"],
    correctAnswer: 3,
    explanation: "An Ace in Blackjack can count as either 1 or 11, depending on which value benefits the hand more.",
    difficulty: 'easy'
  },
  {
    id: 3, 
    question: "What does 'RTP' stand for in casino games?",
    options: ["Real Time Play", "Return To Player", "Royal Tournament Points", "Reward Tier Progress"],
    correctAnswer: 1,
    explanation: "RTP (Return To Player) is the percentage of all wagered money that a slot machine will pay back to players over time.",
    difficulty: 'easy'
  },
  {
    id: 4,
    question: "Which of these is NOT a poker hand?",
    options: ["Full House", "Royal Flush", "Straight", "Triple Pair"],
    correctAnswer: 3,
    explanation: "'Triple Pair' is not a valid poker hand. A single pair and three-of-a-kind exist, but not 'Triple Pair'.",
    difficulty: 'medium'
  },
  {
    id: 5,
    question: "In Roulette, what color is the '0'?",
    options: ["Red", "Black", "Green", "Gold"],
    correctAnswer: 2,
    explanation: "In both American and European roulette, the '0' pocket is colored green.",
    difficulty: 'medium'
  },
  {
    id: 6,
    question: "What is a 'natural' in Baccarat?",
    options: ["Any hand totaling 9", "A hand totaling 8 or 9 on the first two cards", "Three cards of the same suit", "A tie between Player and Banker"],
    correctAnswer: 1,
    explanation: "In Baccarat, a 'natural' is a hand that totals 8 or 9 on the initial deal of two cards.",
    difficulty: 'medium'
  },
  {
    id: 7,
    question: "What casino game has the lowest house edge?",
    options: ["Slots", "Blackjack with perfect strategy", "American Roulette", "Keno"],
    correctAnswer: 1,
    explanation: "Blackjack played with perfect basic strategy typically has the lowest house edge in a casino, sometimes less than 1%.",
    difficulty: 'hard'
  },
  {
    id: 8,
    question: "In craps, what is the 'Don't Pass Line'?",
    options: ["A line you shouldn't cross", "A bet against the shooter", "A bet that play will continue", "A losing roll"],
    correctAnswer: 1,
    explanation: "The 'Don't Pass Line' in craps is a bet that the shooter will lose (betting against the shooter).",
    difficulty: 'hard'
  },
  {
    id: 9,
    question: "What is the probability of being dealt a Royal Flush in poker?",
    options: ["About 1 in 650,000", "About 1 in 65,000", "About 1 in 6,500", "About 1 in 650"],
    correctAnswer: 0,
    explanation: "The probability of being dealt a Royal Flush in poker is approximately 1 in 649,740.",
    difficulty: 'hard'
  },
  {
    id: 10,
    question: "What does 'comps' refer to in casinos?",
    options: ["Competitions between players", "Complimentary items given to players", "Computer-controlled games", "Complicated betting systems"],
    correctAnswer: 1,
    explanation: "'Comps' are complimentary items, services, or privileges given by casinos to reward players for their play, such as free drinks, meals, or hotel rooms.",
    difficulty: 'easy'
  }
];

// Add named export for compatibility
export const quizQuestions = questions;
