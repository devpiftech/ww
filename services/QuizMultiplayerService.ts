import { supabase } from '@/integrations/supabase/client';
import { getRandomBots } from '@/services/bots';

export interface QuizPlayer {
  id: string;
  username: string;
  avatar_url?: string;
  is_bot: boolean;
  ready: boolean;
}

export interface QuizMatch {
  id: string;
  players: QuizPlayer[];
  status: 'waiting' | 'in_progress' | 'completed';
  created_at: Date;
  channel?: any; // Supabase channel
}

// Store for active matches
let activeMatches: QuizMatch[] = [];
let waitingPlayers: QuizPlayer[] = [];

// Create a new quiz match
export const createQuizMatch = (playerId: string, username: string, avatarUrl?: string): QuizMatch => {
  const matchId = `quiz_${Date.now().toString(36)}`;
  
  const player: QuizPlayer = {
    id: playerId,
    username,
    avatar_url: avatarUrl,
    is_bot: false,
    ready: true
  };
  
  const match: QuizMatch = {
    id: matchId,
    players: [player],
    status: 'waiting',
    created_at: new Date()
  };
  
  // Create a channel for the match
  match.channel = supabase.channel(`match_${matchId}`);
  
  // Setup channel and track presence
  match.channel
    .on('presence', { event: 'sync' }, () => {
      console.log('Match presence synced:', match.channel.presenceState());
    })
    .on('presence', { event: 'join' }, (payload) => {
      console.log('Player joined match:', payload);
    })
    .on('presence', { event: 'leave' }, (payload) => {
      console.log('Player left match:', payload);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await match.channel.track({
          user: playerId,
          username,
          status: 'joined'
        });
      }
    });
  
  activeMatches.push(match);
  return match;
};

// Join the matchmaking queue
export const joinQuickMatchQueue = (playerId: string, username: string, avatarUrl?: string): QuizPlayer => {
  // Check if player is already in queue
  const existingPlayer = waitingPlayers.find(p => p.id === playerId);
  if (existingPlayer) return existingPlayer;
  
  const player: QuizPlayer = {
    id: playerId,
    username,
    avatar_url: avatarUrl,
    is_bot: false,
    ready: true
  };
  
  waitingPlayers.push(player);
  return player;
};

// Leave the matchmaking queue
export const leaveQuickMatchQueue = (playerId: string): void => {
  waitingPlayers = waitingPlayers.filter(p => p.id !== playerId);
};

// Find a match with available spots
export const findAvailableMatch = (): QuizMatch | null => {
  return activeMatches.find(m => m.status === 'waiting' && m.players.length < 4) || null;
};

// Create a quick match with other waiting players or AI players
export const createQuickMatch = async (playerId: string, username: string, avatarUrl?: string): Promise<QuizMatch> => {
  // Remove player from waiting list if they're there
  leaveQuickMatchQueue(playerId);
  
  // Create the match
  const match = createQuizMatch(playerId, username, avatarUrl);
  
  // Add waiting players
  const playersNeeded = 4 - match.players.length;
  let playersAdded = 0;
  
  // First try to add real players who are waiting
  if (waitingPlayers.length > 0 && playersAdded < playersNeeded) {
    const availablePlayers = waitingPlayers.filter(p => p.id !== playerId);
    
    for (let i = 0; i < Math.min(availablePlayers.length, playersNeeded); i++) {
      match.players.push(availablePlayers[i]);
      playersAdded++;
    }
    
    // Remove added players from waiting list
    waitingPlayers = waitingPlayers.filter(
      p => !match.players.some(mp => mp.id === p.id)
    );
  }
  
  // Add AI players to fill the match
  const botsNeeded = playersNeeded - playersAdded;
  if (botsNeeded > 0) {
    const bots = getRandomBots(botsNeeded);
    
    bots.forEach(bot => {
      match.players.push({
        id: bot.id,
        username: bot.username,
        avatar_url: bot.avatar_url,
        is_bot: true,
        ready: true
      });
    });
  }
  
  return match;
};

// Challenge a player to a quiz match
export const challengePlayer = async (
  challengerId: string, 
  challengerName: string,
  challengedId: string,
  challengedName: string,
  challengerAvatarUrl?: string,
  challengedAvatarUrl?: string
): Promise<QuizMatch> => {
  const match = createQuizMatch(challengerId, challengerName, challengerAvatarUrl);
  
  // Add challenged player
  match.players.push({
    id: challengedId,
    username: challengedName,
    avatar_url: challengedAvatarUrl,
    is_bot: false,
    ready: false
  });
  
  return match;
};

// Accept a challenge
export const acceptChallenge = async (matchId: string, playerId: string): Promise<QuizMatch | null> => {
  const match = activeMatches.find(m => m.id === matchId);
  if (!match) return null;
  
  const player = match.players.find(p => p.id === playerId);
  if (!player) return null;
  
  player.ready = true;
  
  // Check if all players are ready
  if (match.players.every(p => p.ready)) {
    match.status = 'in_progress';
  }
  
  return match;
};

// Get match by ID
export const getMatch = (matchId: string): QuizMatch | null => {
  return activeMatches.find(m => m.id === matchId) || null;
};

// Get all active matches
export const getAllMatches = (): QuizMatch[] => {
  return [...activeMatches];
};

// Get matches for a player
export const getPlayerMatches = (playerId: string): QuizMatch[] => {
  return activeMatches.filter(m => m.players.some(p => p.id === playerId));
};

// Complete a match and clean up
export const completeMatch = (matchId: string): void => {
  const matchIndex = activeMatches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) return;
  
  const match = activeMatches[matchIndex];
  match.status = 'completed';
  
  // Clean up channel
  if (match.channel) {
    supabase.removeChannel(match.channel);
  }
  
  // Remove match after some time
  setTimeout(() => {
    activeMatches = activeMatches.filter(m => m.id !== matchId);
  }, 60000); // Clean up after 1 minute
};
