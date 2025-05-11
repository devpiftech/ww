
// Interface for recording game results
export interface GameResult {
  id?: string;
  user_id: string | null;
  game: string;
  bet_amount: number;
  win_amount: number;
  is_win: boolean;
  game_data?: Record<string, any>;
}
