
export interface Tournament {
  id: string;
  title: string;
  description: string;
  prizePool: number;
  participants: number;
  endTime: Date;
  game: 'slots' | 'quiz';
  type: 'daily' | 'weekly' | 'monthly';
  style: 'standard' | 'premium' | 'seasonal' | 'championship';
  isActive: boolean;
  winners?: TournamentWinner[];
}

export interface TournamentWinner {
  userId: string;
  username: string;
  avatarUrl?: string;
  rank: number;
  prize: number;
  score: number;
}

export interface TournamentEntry {
  id: string;
  user_id: string;
  tournament_id: string;
  score: number;
  username: string;
  entry_date: string;
  rank?: number;
  prize?: number;
}
