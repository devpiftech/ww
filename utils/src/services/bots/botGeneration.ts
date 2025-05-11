
import { nanoid } from 'nanoid';
import { BotUser } from './types';

// Bot name options
const botFirstNames = [
  'SlotMaster', 'CardShark', 'RoulettePro', 'JackpotKing', 'PokerFace',
  'AceDealer', 'BlackjackBaron', 'LuckySpinner', 'WildGambler', 'DiceRoller',
  'RoyalFlush', 'HighRoller', 'LuckyDraw', 'GoldenSpinner', 'CasinoWhiz',
  'ChipCollector', 'BetWinner', 'JackpotHunter', 'FortuneSeeker', 'GamblingPro'
];

/**
 * Get random bot users for multiplayer simulations
 * @param count Number of bots to get
 * @returns Array of bot users
 */
export const getRandomBots = (count: number): BotUser[] => {
  const bots: BotUser[] = [];
  
  // Randomly select bot names
  const selectedBots = [...botFirstNames].sort(() => 0.5 - Math.random()).slice(0, count);
  
  // Create bot objects
  for (let i = 0; i < count; i++) {
    const botName = selectedBots[i] || `Bot${Math.floor(Math.random() * 1000)}`;
    bots.push({
      id: `bot-${Date.now()}-${i}`,
      username: botName,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${botName}`,
      is_bot: true
    });
  }
  
  return bots;
};

// For backwards compatibility
export const getRandomBot = (count: number = 1): BotUser[] => {
  return getRandomBots(count);
};
