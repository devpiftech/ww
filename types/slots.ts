
// Define slot machine symbol types
export interface SlotSymbol {
  id: string;
  value: number; // Payout multiplier
  emoji: string; // Visual representation
  isWild?: boolean;
  isScatter?: boolean;
  isBonus?: boolean;
}

// Define win patterns
export interface WinPattern {
  id: string;
  name: string;
  multiplier: number;
}

// Define payout configurations
export interface PayoutConfig {
  [key: string]: number;
}

// Slot machine data interface
export interface SlotMachineConfig {
  id: string;
  name: string;
  reels: number;
  rows: number;
  paylines: number;
  minBet: number;
  maxBet: number;
  rtp: number;
  symbols: SlotSymbol[];
  bonusFeatures?: {
    name: string;
    description: string;
    trigger: string;
  }[];
  payouts: PayoutConfig;
}

// Game state for slot machines
export interface SlotMachineState {
  coins: number;
  betAmount: number;
  spinning: boolean;
  results: SlotSymbol[][];
  lastWin: number;
  bonusActive: boolean;
  freeSpins: number;
  multiplier: number;
}

// Sportsbook types
export interface SportEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: string; // ISO date string
  status: 'scheduled' | 'live' | 'completed' | 'postponed';
  homeScore?: number;
  awayScore?: number;
}

export interface SportsBet {
  id: string;
  eventId: string;
  type: 'moneyline' | 'spread' | 'total' | 'prop';
  pick: string; // e.g., "home", "away", "over", "under", etc.
  odds: number; // Decimal odds
  amount: number; // Bet amount
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost' | 'void' | 'cashout';
}

export interface SportCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface BetOdds {
  type: string;
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number;
  overOdds?: number;
  underOdds?: number;
  spreadPoints?: number;
  totalPoints?: number;
}
