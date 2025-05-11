import { nanoid } from 'nanoid';
import { BotConfigData, BotUser, BotMessage } from '../types/supabaseTypes';
import { supabase } from '@/integrations/supabase/client';
import { isGameEnabled } from '../gameResults/isGameEnabled';

interface BotState {
  isRunning: boolean;
  activeBots: BotUser[];
  config: Partial<BotConfigData>;
  messages: BotMessage[];
  timers: {
    join?: NodeJS.Timeout;
    chat?: NodeJS.Timeout;
    leave?: NodeJS.Timeout;
  };
}

// Names for bot generation
const FIRST_NAMES = ['Lucky', 'Jackpot', 'Golden', 'Diamond', 'Royal', 'Wealthy', 'Fortune', 'Star', 'Wild', 'Mega', 'Super', 'Silver', 'Ace'];
const LAST_NAMES = ['Winner', 'Player', 'Gambler', 'Roller', 'Master', 'Champion', 'King', 'Queen', 'Lord', 'Shark', 'Hunter', 'Pro', 'Expert'];

const DEFAULT_CONFIG: Partial<BotConfigData> = {
  min_bots: 3,
  max_bots: 10,
  join_frequency: 30000,
  chat_frequency: 60000,
  leave_frequency: 45000
};

// Bot simulation state
let botState: BotState = {
  isRunning: false,
  activeBots: [],
  config: DEFAULT_CONFIG,
  messages: [],
  timers: {}
};

/**
 * Loads bot configuration from Supabase
 */
export const loadBotConfig = async (): Promise<BotConfigData | null> => {
  try {
    // Try to load config from database
    const { data: botConfigs, error } = await supabase
      .from('bot_configs')
      .select('*')
      .eq('is_active', true)
      .limit(1);
    
    if (error) {
      console.error('Error loading bot config:', error);
      return null;
    }
    
    if (botConfigs && botConfigs.length > 0) {
      const config = botConfigs[0] as BotConfigData;
      return {
        ...config,
        // Map database fields to application fields for compatibility
        minBots: config.min_bots,
        maxBots: config.max_bots,
        joinFrequency: config.join_frequency,
        chatFrequency: config.chat_frequency,
        leaveFrequency: config.leave_frequency
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in loadBotConfig:', error);
    return null;
  }
};

/**
 * Starts the bot simulation with the provided config
 * @param config Bot configuration
 */
export const startBotSimulation = async (config: Partial<BotConfigData> = {}): Promise<void> => {
  try {
    // Stop any existing simulation
    stopBotSimulation();
    
    // Load config from database, or use provided config
    const dbConfig = await loadBotConfig();
    
    // Set the configuration, using provided config, database config, or default
    botState.config = {
      ...DEFAULT_CONFIG,
      ...(dbConfig || {}),
      ...config
    };
    
    const minBots = botState.config.min_bots || DEFAULT_CONFIG.min_bots!;
    const maxBots = botState.config.max_bots || DEFAULT_CONFIG.max_bots!;
    const joinFrequency = botState.config.join_frequency || DEFAULT_CONFIG.join_frequency!;
    const chatFrequency = botState.config.chat_frequency || DEFAULT_CONFIG.chat_frequency!;
    const leaveFrequency = botState.config.leave_frequency || DEFAULT_CONFIG.leave_frequency!;
    
    console.log(`Starting bot simulation with ${minBots}-${maxBots} bots`);
    
    // Initialize with minimum number of bots
    for (let i = 0; i < minBots; i++) {
      addBot();
    }
    
    // Start timers for automated bot actions
    botState.timers.join = setInterval(addBot, joinFrequency);
    botState.timers.chat = setInterval(generateBotChat, chatFrequency);
    botState.timers.leave = setInterval(removeRandomBot, leaveFrequency);
    
    botState.isRunning = true;
  } catch (error) {
    console.error('Error starting bot simulation:', error);
  }
};

/**
 * Stops the bot simulation
 */
export const stopBotSimulation = (): void => {
  try {
    // Clear all timers
    Object.values(botState.timers).forEach(timer => {
      if (timer) clearInterval(timer);
    });
    
    // Reset state
    botState = {
      isRunning: false,
      activeBots: [],
      config: DEFAULT_CONFIG,
      messages: [],
      timers: {}
    };
    
    console.log('Bot simulation stopped');
  } catch (error) {
    console.error('Error stopping bot simulation:', error);
  }
};

/**
 * Checks if bot simulation is running
 */
export const isBotSimulationRunning = (): boolean => {
  return botState.isRunning;
};

/**
 * Gets count of active bots
 */
export const getActiveBotCount = (): number => {
  return botState.activeBots.length;
};

/**
 * Gets all active bots
 */
export const getActiveBots = (): BotUser[] => {
  return [...botState.activeBots];
};

/**
 * Gets recent bot messages
 */
export const getBotMessages = (): BotMessage[] => {
  return [...botState.messages];
};

/**
 * Adds a new bot to the simulation
 */
const addBot = (): void => {
  try {
    const minBots = botState.config.min_bots || DEFAULT_CONFIG.min_bots!;
    const maxBots = botState.config.max_bots || DEFAULT_CONFIG.max_bots!;
    
    // Don't add if we're already at max capacity
    if (botState.activeBots.length >= maxBots) return;
    
    // Generate bot name
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const username = `${firstName}${lastName}${Math.floor(Math.random() * 100)}`;
    
    // Create bot
    const newBot: BotUser = {
      id: nanoid(),
      username,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      is_bot: true
    };
    
    // Add bot to list
    botState.activeBots.push(newBot);
    
    // Log new bot
    console.log(`Bot joined: ${newBot.username}`);
    
    // Simulate bot playing a game
    setTimeout(() => {
      simulateBotGame(newBot);
    }, Math.random() * 5000 + 1000);
  } catch (error) {
    console.error('Error adding bot:', error);
  }
};

/**
 * Removes a random bot from the simulation
 */
const removeRandomBot = (): void => {
  try {
    const minBots = botState.config.min_bots || DEFAULT_CONFIG.min_bots!;
    
    // Don't remove if we're already at min capacity
    if (botState.activeBots.length <= minBots) return;
    
    // Remove random bot
    const indexToRemove = Math.floor(Math.random() * botState.activeBots.length);
    const removedBot = botState.activeBots.splice(indexToRemove, 1)[0];
    
    // Log removed bot
    console.log(`Bot left: ${removedBot.username}`);
  } catch (error) {
    console.error('Error removing bot:', error);
  }
};

/**
 * Generates a random chat message from a bot
 */
const generateBotChat = (): void => {
  try {
    // Don't generate message if no bots
    if (botState.activeBots.length === 0) return;
    
    // Select random bot
    const randomBot = botState.activeBots[Math.floor(Math.random() * botState.activeBots.length)];
    
    // Messages the bot might say
    const messages = [
      'Just won big!',
      'This game is on fire today!',
      'Anyone else feeling lucky?',
      'I love this casino!',
      'Going for the jackpot!',
      'I think today is my day',
      'Best game ever!',
      'Come join this game',
      'Almost hit the big one',
      'Going to win it all back now',
      'Need one more spin to win',
      'Saving up for the tournament',
      'Anyone in the tournament?',
      'The slots are hot right now!',
      'Just doubled my money'
    ];
    
    // Generate message
    const message: BotMessage = {
      id: nanoid(),
      botId: randomBot.id,
      botName: randomBot.username,
      content: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date().toISOString()
    };
    
    // Add message to list
    botState.messages.unshift(message);
    
    // Keep only last 20 messages
    if (botState.messages.length > 20) {
      botState.messages = botState.messages.slice(0, 20);
    }
    
    console.log(`Bot chat: ${message.botName}: ${message.content}`);
  } catch (error) {
    console.error('Error generating bot chat:', error);
  }
};

/**
 * Simulates a bot playing a game
 * @param bot The bot to simulate a game for
 */
const simulateBotGame = async (bot: BotUser): Promise<void> => {
  try {
    // Games the bot might play
    const games = ['slots', 'blackjack', 'roulette', 'poker', 'dice'];
    
    // Select random game
    const randomGame = games[Math.floor(Math.random() * games.length)];
    
    // Check if game is enabled
    const gameEnabled = await isGameEnabled(randomGame);
    if (!gameEnabled) {
      console.log(`Bot ${bot.username} tried to play ${randomGame} but it's disabled`);
      return;
    }
    
    // Random bet between 10 and 100
    const betAmount = Math.floor(Math.random() * 90) + 10;
    
    // 40% chance of winning
    const isWin = Math.random() < 0.4;
    
    // If win, random amount between bet and 3x bet
    const winAmount = isWin ? Math.floor(betAmount * (Math.random() * 2 + 1)) : 0;
    
    console.log(`Bot ${bot.username} played ${randomGame}, bet ${betAmount}, ${isWin ? 'won ' + winAmount : 'lost'}`);
    
    // Schedule next game after random time
    const nextGameDelay = Math.floor(Math.random() * 10000) + 5000;
    setTimeout(() => {
      simulateBotGame(bot);
    }, nextGameDelay);
  } catch (error) {
    console.error('Error simulating bot game:', error);
  }
};
