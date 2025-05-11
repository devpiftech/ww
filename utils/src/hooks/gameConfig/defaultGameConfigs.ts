
import { GameConfig } from '@/types/admin';

// Default game configurations (same as in admin panel)
export const defaultGameConfigs: GameConfig[] = [
  {
    id: 'blackjack',
    name: 'Blackjack',
    min_bet: 5,
    max_bet: 1000,
    enabled: true,
    rtp: 99.5,
    house_edge: 0.5,
    payouts: {
      'blackjack': 1.5,
      'regular': 1,
      'insurance': 2
    }
  },
  {
    id: 'roulette-us',
    name: 'American Roulette',
    min_bet: 5,
    max_bet: 1000,
    enabled: true,
    rtp: 94.74,
    house_edge: 5.26,
    payouts: {
      'straight': 35,
      'split': 17,
      'street': 11,
      'corner': 8,
      'sixline': 5,
      'column': 2,
      'dozen': 2,
      'red': 1,
      'black': 1,
      'odd': 1,
      'even': 1,
      'high': 1,
      'low': 1
    }
  },
  {
    id: 'roulette-eu',
    name: 'European Roulette',
    min_bet: 5,
    max_bet: 1000,
    enabled: true,
    rtp: 97.3,
    house_edge: 2.7,
    payouts: {
      'straight': 35,
      'split': 17,
      'street': 11,
      'corner': 8,
      'sixline': 5,
      'column': 2,
      'dozen': 2,
      'red': 1,
      'black': 1,
      'odd': 1,
      'even': 1,
      'high': 1,
      'low': 1
    }
  },
  {
    id: 'highlow',
    name: 'High Low',
    min_bet: 5,
    max_bet: 500,
    enabled: true,
    rtp: 98.0,
    house_edge: 2.0,
    payouts: {
      'win': 1
    }
  },
  {
    id: 'cointoss',
    name: 'Coin Toss',
    min_bet: 5,
    max_bet: 500,
    enabled: true,
    rtp: 97.0,
    house_edge: 3.0,
    payouts: {
      'win': 1.94
    }
  },
  {
    id: 'dice',
    name: 'Casino Dice',
    min_bet: 5,
    max_bet: 500,
    enabled: true,
    rtp: 98.6,
    house_edge: 1.4,
    payouts: {
      'number': 5,
      'range': 1
    }
  },
  {
    id: 'racing',
    name: 'Virtual Racing',
    min_bet: 10,
    max_bet: 1000,
    enabled: true,
    rtp: 92.0,
    house_edge: 8.0,
    payouts: {
      'win': 4.5,
      'place': 1.8,
      'show': 1.2
    }
  },
  {
    id: 'picknumber',
    name: 'Lucky Number',
    min_bet: 5,
    max_bet: 100,
    enabled: true,
    rtp: 90.0,
    house_edge: 10.0,
    payouts: {
      'exact': 9,
      'adjacent': 2
    }
  },
  {
    id: 'quiz',
    name: 'Casino Quiz',
    min_bet: 5,
    max_bet: 100,
    enabled: true,
    rtp: 95.0,
    house_edge: 5.0,
    payouts: {
      'correct': 2,
      'streak_bonus': 0.5
    }
  }
];
