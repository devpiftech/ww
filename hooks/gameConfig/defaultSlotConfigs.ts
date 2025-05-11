
import { SlotMachineConfig } from '@/types/admin';

export const defaultSlotConfigs: SlotMachineConfig[] = [
  {
    id: 'slot-classic',
    name: 'Classic Slots',
    min_bet: 1,
    max_bet: 100,
    enabled: true,
    rtp: 96.0,
    house_edge: 4.0,
    slot_type: 'classic',
    reels: 3,
    symbols_per_reel: 5,
    bonus_frequency: 5.0,
    jackpot_seed: 0,
    jackpot_contribution: 0,
    special_features: ['wild_substitutions', 'scatter_pays'],
    symbol_weights: {
      'cherry': 25,
      'lemon': 25,
      'orange': 20,
      'plum': 15,
      'bell': 10,
      'seven': 5
    },
    payouts: {
      'three_seven': 50,
      'three_bell': 25,
      'three_plum': 15,
      'three_orange': 10,
      'three_lemon': 5,
      'three_cherry': 3,
      'two_seven': 2,
      'two_bell': 1
    }
  },
  {
    id: 'slot-fruity',
    name: 'Fruity Slots',
    min_bet: 1,
    max_bet: 200,
    enabled: true,
    rtp: 95.5,
    house_edge: 4.5,
    slot_type: 'fruity',
    reels: 5,
    symbols_per_reel: 4,
    bonus_frequency: 7.5,
    jackpot_seed: 0,
    jackpot_contribution: 0,
    special_features: ['wild_substitutions', 'free_spins', 'multipliers'],
    symbol_weights: {
      'strawberry': 20,
      'banana': 20,
      'apple': 20,
      'watermelon': 15,
      'pineapple': 15,
      'wild_fruit': 10
    },
    payouts: {
      'five_wild_fruit': 200,
      'four_wild_fruit': 50,
      'three_wild_fruit': 20,
      'five_watermelon': 100,
      'four_watermelon': 25,
      'three_watermelon': 10,
      'five_of_kind': 75,
      'four_of_kind': 15,
      'three_of_kind': 5
    }
  },
  {
    id: 'slot-space',
    name: 'Space Slots',
    min_bet: 5,
    max_bet: 500,
    enabled: true,
    rtp: 95.0,
    house_edge: 5.0,
    slot_type: 'space',
    reels: 5,
    symbols_per_reel: 4,
    bonus_frequency: 6.0,
    jackpot_seed: 0,
    jackpot_contribution: 0,
    special_features: ['wild_substitutions', 'free_spins', 'cascading_reels', 'expanding_wilds'],
    symbol_weights: {
      'planet': 25,
      'rocket': 20,
      'astronaut': 20,
      'alien': 15,
      'ufo': 10,
      'black_hole': 10
    },
    payouts: {
      'five_black_hole': 250,
      'four_black_hole': 50,
      'three_black_hole': 15,
      'five_ufo': 125,
      'four_ufo': 25,
      'three_ufo': 10,
      'five_alien': 75,
      'four_alien': 15,
      'three_alien': 5,
      'five_any': 50,
      'four_any': 10,
      'three_any': 3
    }
  },
  {
    id: 'slot-jackpot',
    name: 'Jackpot Slots',
    min_bet: 10,
    max_bet: 1000,
    enabled: true,
    rtp: 94.0,
    house_edge: 6.0,
    slot_type: 'jackpot',
    reels: 5,
    symbols_per_reel: 3,
    bonus_frequency: 4.0,
    jackpot_seed: 10000,
    jackpot_contribution: 2.5,
    special_features: ['wild_substitutions', 'scatter_pays', 'free_spins', 'bonus_game', 'multipliers'],
    symbol_weights: {
      'diamond': 5,
      'crown': 10,
      'gold_bar': 15,
      'ruby': 20,
      'emerald': 25,
      'sapphire': 25
    },
    payouts: {
      'five_diamond': 1000,
      'four_diamond': 250,
      'three_diamond': 50,
      'five_crown': 500,
      'four_crown': 100,
      'three_crown': 25,
      'five_gold_bar': 250,
      'four_gold_bar': 50,
      'three_gold_bar': 15,
      'five_jewels': 100,
      'four_jewels': 25,
      'three_jewels': 5,
      'mega_jackpot': 'progressive',
      'mini_jackpot': 1000
    }
  }
];
