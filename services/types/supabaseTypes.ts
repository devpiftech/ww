
import { Json } from '@/integrations/supabase/types';
import { BetOdds } from '@/types/slots';

// Define leaderboard data interface
export interface LeaderboardData {
  id: string;
  username: string | null;
  avatar_url: string | null;
  games_played: number;
  total_winnings: number;
  games_won: number;
  win_rate: number;
  biggest_win: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar_url?: string;
  score: number;
  winnings: number;
  isPlayer?: boolean;
  user_id: string;
}

// Updated type for tournament entries from RPC function
export interface TournamentLeaderboardResponse {
  id: string;
  user_id: string;
  score: number;
  rank: number;
  username: string | null;
  avatar_url: string | null;
}

// Updated type for tournament details from RPC function
export interface TournamentDetails {
  id: string;
  title: string;
  description: string;
  prize_pool: number;
  entry_fee: number;
  max_participants: number;
  current_participants: number;
  start_date: string;
  end_date: string;
  game_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Updated Bot simulation configuration options
export interface BotSimulationConfig {
  id: string;
  name?: string;
  enabled: boolean;
  bot_count?: number;
  min_bet: number;
  max_bet: number;
  min_wait: number;
  max_wait: number;
  games: string[];
  created_at: string;
  // Additional properties for bot panel
  minBots?: number;
  maxBots?: number;
  joinFrequency?: number;
  chatFrequency?: number;
  leaveFrequency?: number;
  gameTimeMin?: number;
  gameTimeMax?: number;
}

// Mock database tables not in the Supabase types
export interface BotConfigData {
  id: string;
  min_bots: number;
  max_bots: number;
  join_frequency: number;
  chat_frequency: number;
  leave_frequency: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // For compatibility with panel
  name?: string;
  bot_count?: number;
  minBots?: number;
  maxBots?: number;
  joinFrequency?: number;
  chatFrequency?: number;
  leaveFrequency?: number;
}

export interface TournamentEntry {
  id: string;
  user_id: string;
  tournament_id: string;
  score: number;
  joined_at: string;
  username?: string;
  avatar_url?: string;
  rank?: number;
}

// Types for database interactions and function calls
export interface BotUser {
  id: string;
  username: string;
  avatar_url: string;
  is_bot: boolean;
}

export interface BotMessage {
  id: string;
  botId: string;
  botName: string;
  content: string;
  timestamp: string;
}

// Updated Response types for RPC functions
export interface LeaderboardResponse {
  id: string;
  username: string;
  avatar_url: string | null;
  games_played: number;
  games_won: number;
  total_winnings: number;
  biggest_win: number;
  win_rate: number;
}

export interface UserRankResponse {
  rank: number;
  games_played: number;
  total_winnings: number;
}

export interface UserTournamentStandingResponse {
  rank: number;
  score: number;
}

// Define Game Config interfaces
export interface GameConfig {
  id: string;
  name: string;
  min_bet: number;
  max_bet: number;
  enabled: boolean;
  rtp: number;
  house_edge: number;
  payouts: any;
  slot_type?: string;
}

export interface SlotMachineConfig extends GameConfig {
  slot_type: string;
  reels: number;
  symbols_per_reel: number;
  bonus_frequency: number;
  jackpot_seed: number;
  symbol_weights: any;
  jackpot_contribution: number;
  special_features: any[];
}

// Enhanced sportsbook types
export interface SportsbookConfig {
  sweeps_rtp_cap: number;
  regular_rtp_cap: number;
  sweeps_risk_threshold: number;
  regular_risk_threshold: number;
  sweeps_house_edge: number;
  regular_house_edge: number;
  max_sweeps_payout: number;
  max_regular_payout: number;
}

export interface MarketExposure {
  eventId: string;
  market: string;
  outcomes: Record<string, number>;
  totalBets: number;
  currencyType: 'waynebucks' | 'waynesweeps';
}

export interface OddsAdjustment {
  eventId: string;
  marketType: string;
  adjustedOdds: BetOdds;
  originalOdds: BetOdds;
  exposureRatio: Record<string, number>;
}
