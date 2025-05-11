export interface GameConfig {
  id: string;
  name: string;
  min_bet: number;
  max_bet: number;
  enabled: boolean;
  rtp: number;
  house_edge: number;
  payouts: Record<string, number | string>;
}

export interface SlotMachineConfig extends GameConfig {
  slot_type: 'classic' | 'fruity' | 'space' | 'jackpot';
  reels: number;
  symbols_per_reel: number;
  bonus_frequency: number;
  jackpot_seed: number;
  jackpot_contribution: number;
  symbol_weights: Record<string, number>;
  special_features: string[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalBets: number;
  totalWagered: number;
  grossRevenue: number;
  houseEdge: number;
}
