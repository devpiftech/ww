
// Define the base UserPreferences type
export interface UserPreferences {
  darkMode: boolean;
  soundEffects: boolean;
  notifications: boolean;
  preferredCurrency: 'waynebucks' | 'waynesweeps';
}

// Define the TimeReward type
export interface TimeReward {
  id: string;
  user_id: string;
  last_claimed: string;
  claim_count: number;
  currency_type: 'waynebucks' | 'waynesweeps';
  created_at: string;
}

// Define the Transaction type
export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  game: string | null;
  created_at: string;
  metadata?: {
    currency_type?: 'waynebucks' | 'waynesweeps';
    [key: string]: any;
  };
}

// Define the ChatMessage type
export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
  avatar_url: string | null;
  room: string;
}

// Define type for BetOdds
export interface BetOdds {
  home: number;
  away: number;
  draw?: number;
  over?: number;
  under?: number;
}
