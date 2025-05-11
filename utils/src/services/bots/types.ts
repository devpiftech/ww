
/**
 * Bot simulation configuration options
 */
export interface BotSimulationConfig {
  minBots?: number;
  maxBots?: number;
  chatFrequency?: number;  // milliseconds between chat messages
  joinFrequency?: number;  // milliseconds between players joining
  leaveFrequency?: number; // milliseconds between players leaving
  gameTimeMin?: number;    // minimum time a bot spends in a game
  gameTimeMax?: number;    // maximum time a bot spends in a game
}

/**
 * Bot user interface
 */
export interface BotUser {
  id: string;
  username: string;
  avatar_url: string;
  is_bot: boolean;
}

/**
 * Bot configuration settings from database
 */
export interface BotConfig {
  minBots: number;
  maxBots: number;
  joinFrequency: number;
  chatFrequency: number;
  leaveFrequency: number;
  isActive: boolean;
}

/**
 * Bot configuration data from the database
 */
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
}

/**
 * Bot message structure
 */
export interface BotMessage {
  id: string;
  botId: string;
  botName: string;
  content: string;
  timestamp: string;
}
