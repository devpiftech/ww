
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';

// Bot name options
const botFirstNames = [
  'Alex', 'Bailey', 'Casey', 'Dakota', 'Ellis', 
  'Finley', 'Gray', 'Harper', 'Jordan', 'Kennedy',
  'Logan', 'Morgan', 'Nova', 'Quinn', 'Riley',
  'Skyler', 'Taylor', 'Val', 'Winter', 'Zion'
];

const botLastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Lee', 'Walker', 'Hall', 'Allen', 'Young',
  'King', 'Wright', 'Scott', 'Green', 'Baker'
];

// Game activity messages
const gameJoinMessages = [
  "Just joined! Looking for a game.",
  "Ready to play! Anyone want to challenge me?",
  "Hello everyone! Who's up for a match?",
  "Is this where the action is? Count me in!",
  "Ready to test my luck today!",
];

const chatMessages = [
  "How's everyone doing today?",
  "Just won 500 coins on slots! Pretty lucky!",
  "Anyone else having a good winning streak?",
  "What's your favorite game here?",
  "Just hit a big jackpot on the slots!",
  "Any tips for the quiz game?",
  "I'm on a roll today!",
  "Hey all, new here. How does the quiz game work?",
  "Good luck to everyone playing!",
  "This casino is awesome!",
  "Anyone up for a quick challenge?",
  "Who's the quiz champion here?",
  "I love these casino games!",
  "Just broke my personal record!",
  "I'm hoping to reach the leaderboard soon.",
];

// Bot types and interfaces
export interface AIBot {
  id: string;
  username: string;
  avatar_url: string;
  skill_level: 'beginner' | 'intermediate' | 'expert';
  active_games: string[];
  last_activity: Date;
}

// Bot generation functions
export const generateBotName = (): string => {
  const firstName = botFirstNames[Math.floor(Math.random() * botFirstNames.length)];
  const lastName = botLastNames[Math.floor(Math.random() * botLastNames.length)];
  return `${firstName}${lastName}${Math.floor(Math.random() * 100)}`;
};

export const generateBotAvatar = (botName: string): string => {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${botName}`;
};

export const createBot = (): AIBot => {
  const botName = generateBotName();
  return {
    id: 'bot_' + nanoid(8),
    username: botName,
    avatar_url: generateBotAvatar(botName),
    skill_level: ['beginner', 'intermediate', 'expert'][Math.floor(Math.random() * 3)] as 'beginner' | 'intermediate' | 'expert',
    active_games: [],
    last_activity: new Date(),
  };
};

// Simulate bot activities
export const simulateBotChatMessage = async (room: string): Promise<void> => {
  try {
    const bot = createBot();
    const message = chatMessages[Math.floor(Math.random() * chatMessages.length)];
    
    await supabase.from('chat_messages').insert({
      user_id: bot.id,
      username: bot.username,
      avatar_url: bot.avatar_url,
      content: message,
      room
    });
  } catch (error) {
    console.error('Error simulating bot chat message:', error);
  }
};

export const simulateBotJoinGame = async (gameName: string): Promise<AIBot> => {
  const bot = createBot();
  bot.active_games.push(gameName);
  
  // Add bot to presence channel
  try {
    const channel = supabase.channel('online_players');
    await channel.subscribe();
    
    const presenceData = {
      id: bot.id,
      username: bot.username,
      avatar_url: bot.avatar_url,
      last_activity: new Date(),
      current_game: gameName
    };
    
    await channel.track(presenceData);
    
    return bot;
  } catch (error) {
    console.error('Error simulating bot joining game:', error);
    return bot;
  }
};

export const simulateBotLeaveGame = async (bot: AIBot, gameName: string): Promise<void> => {
  bot.active_games = bot.active_games.filter(g => g !== gameName);
  
  // Update presence channel
  try {
    const channel = supabase.channel('online_players');
    await channel.subscribe();
    
    const presenceData = {
      id: bot.id,
      username: bot.username,
      avatar_url: bot.avatar_url,
      last_activity: new Date(),
      current_game: undefined
    };
    
    await channel.track(presenceData);
  } catch (error) {
    console.error('Error simulating bot leaving game:', error);
  }
};
