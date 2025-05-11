
export interface PlayingCard {
  suit: string;
  value: string;
  numericValue: number;
}

export type GameState = 'betting' | 'playing' | 'splitting' | 'dealerTurn' | 'gameOver';

export interface BlackjackContext {
  gameState: GameState;
  playerHand: PlayingCard[];
  playerSplitHand: PlayingCard[];
  dealerHand: PlayingCard[];
  dealerCardHidden: boolean;
  message: string;
  activeSplitHand: boolean;
  betAmount: number;
  isLoading: boolean;
  hasPlayerSplit: boolean;
  calculateHandValue: (hand: PlayingCard[]) => number;
}
