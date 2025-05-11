import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BotConfigData, BotSimulationConfig } from '../types/supabaseTypes';
import { startBotSimulation } from '../bots';
import { getTournamentDetails } from './tournamentGenerator';
import { getTournamentLeaderboard } from './tournamentLeaderboard';
import { nanoid } from 'nanoid';
import { TournamentEntry } from '../types/supabaseTypes';

/**
 * Join a tournament
 * @param tournamentId Tournament to join
 * @param userId User who is joining
 */
export const joinTournament = async (
  tournamentId: string,
  userId: string | null
): Promise<boolean> => {
  if (!userId) {
    toast.error('You must be logged in to join a tournament');
    return false;
  }
  
  try {
    // Start bot simulation with compatible properties
    const botConfig: BotSimulationConfig = {
      id: 'tournament-bots',
      enabled: true,
      bot_count: 10,
      min_bet: 10,
      max_bet: 100,
      min_wait: 5000,
      max_wait: 15000,
      games: ['slots', 'quiz'],
      created_at: new Date().toISOString(),
      minBots: 5,
      maxBots: 20,
      joinFrequency: 30000,
      chatFrequency: 60000,
      leaveFrequency: 45000
    };
    
    startBotSimulation(botConfig);
    
    // Get the tournament details
    const tournamentData = await getTournamentDetails(tournamentId);
    // Ensure we have a single tournament, not an array
    const tournament = Array.isArray(tournamentData) ? tournamentData[0] : tournamentData;
    
    if (!tournament) {
      toast.error('Tournament not found');
      return false;
    }

    // Check if user is already in the tournament
    // In a production app, this would check the tournament_entries table
    // For this mock implementation, we'll use localStorage
    console.log(`Checking if user ${userId} is already in tournament ${tournamentId}`);
    
    // Check localStorage as our mock database
    const joinedTournaments = JSON.parse(localStorage.getItem('joinedTournaments') || '[]');
    const existingEntry = joinedTournaments.includes(tournamentId);
    
    if (existingEntry) {
      // User has already joined this tournament
      toast.success(`You've already joined the ${tournament.title}!`, {
        description: 'Good luck and have fun!'
      });
      
      // Store the current tournament type for the specific game
      localStorage.setItem(`current_${tournament.game}_tournament`, tournamentId);
      
      return true;
    }
    
    // Insert new tournament entry - mock in this implementation
    console.log(`Adding user ${userId} to tournament ${tournamentId}`);
    
    toast.success(`You've joined the ${tournament.title}!`, {
      description: 'Good luck and have fun!'
    });
    
    // Store the joined tournament ID in localStorage to maintain state between pages
    if (!joinedTournaments.includes(tournamentId)) {
      joinedTournaments.push(tournamentId);
      localStorage.setItem('joinedTournaments', JSON.stringify(joinedTournaments));
    }
    
    // Store the current tournament type for the specific game
    localStorage.setItem(`current_${tournament.game}_tournament`, tournamentId);
    
    return true;
  } catch (error) {
    console.error('Error joining tournament:', error);
    toast.error('Failed to join tournament');
    return false;
  }
};

/**
 * Submit a score for a tournament
 * @param tournamentId Tournament to submit score to
 * @param userId User submitting the score
 * @param score Score to submit
 */
export const submitTournamentScore = async (
  tournamentId: string, 
  userId: string, 
  score: number
): Promise<boolean> => {
  if (!userId) {
    console.error('Cannot submit score: No user ID provided');
    return false;
  }
  
  try {
    // In this mock implementation, we're simulating the tournament score submission
    console.log(`Submitting score ${score} for user ${userId} to tournament ${tournamentId}`);
    
    // Mock entry for non-production environment
    // In a production app, this would interact with the tournament_entries table
    const mockEntryId = nanoid();

    // Auto-join the tournament if not already joined
    const joinResult = await joinTournament(tournamentId, userId);
    if (!joinResult) return false;
    
    // Show toast only for significant score updates
    if (score > 100) {
      toast.success('Tournament score submitted!', {
        description: `Your score of ${score} has been recorded.`
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error submitting tournament score:', error);
    return false;
  }
};

/**
 * Award prizes to tournament winners
 * @param tournamentId Tournament to award prizes for
 */
export const awardTournamentPrizes = async (tournamentId: string): Promise<boolean> => {
  try {
    const leaderboard = await getTournamentLeaderboard(tournamentId);
    const tournamentData = await getTournamentDetails(tournamentId);
    
    // Ensure we have a single tournament, not an array
    const tournament = Array.isArray(tournamentData) ? tournamentData[0] : tournamentData;
    
    if (!tournament) {
      console.error('Tournament not found');
      return false;
    }
    
    // Calculate prize distribution
    const winners = leaderboard.slice(0, 5).map((entry, index) => {
      const rank = index + 1;
      const prize = calculatePrize(tournament.prizePool || 10000, rank);
      
      return {
        userId: entry.user_id,
        username: entry.username || `Player${rank}`,
        avatarUrl: entry.avatar_url || "",
        rank,
        prize,
        score: entry.score
      };
    });
    
    // In a production environment, this would update the tournament status and award prizes
    console.log(`Tournament ${tournamentId} completed. Awarding prizes to winners:`, winners);
    
    // Award prizes to winners by updating their balances - mock implementation
    for (const winner of winners) {
      try {
        // In a production app, this would use the update_balance RPC function
        console.log(`Awarded ${winner.prize} to ${winner.username} for rank ${winner.rank} in ${tournament.title}`);
      } catch (error) {
        console.error(`Error awarding prize to ${winner.username}:`, error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error awarding tournament prizes:', error);
    return false;
  }
};

/**
 * Calculate prize amount based on rank
 * @param totalPrize Total prize pool
 * @param rank Player rank
 */
const calculatePrize = (totalPrize: number, rank: number): number => {
  // Prize distribution: 50% for 1st, 25% for 2nd, 15% for 3rd, 7% for 4th, 3% for 5th
  switch (rank) {
    case 1: return Math.round(totalPrize * 0.5);
    case 2: return Math.round(totalPrize * 0.25);
    case 3: return Math.round(totalPrize * 0.15);
    case 4: return Math.round(totalPrize * 0.07);
    case 5: return Math.round(totalPrize * 0.03);
    default: return 0; // No prize for ranks below 5th
  }
};

/**
 * Check if user has joined a specific tournament
 * @param tournamentId Tournament to check
 * @returns Boolean indicating if user has joined the tournament
 */
export const hasJoinedTournament = async (tournamentId: string, userId?: string): Promise<boolean> => {
  if (!userId) {
    // Fall back to localStorage for non-authenticated users
    try {
      const joinedTournaments = JSON.parse(localStorage.getItem('joinedTournaments') || '[]');
      return joinedTournaments.includes(tournamentId);
    } catch (error) {
      console.error('Error checking joined tournaments:', error);
      return false;
    }
  }
  
  try {
    // In a production app, this would check the tournament_entries table
    // For now, return a mock response
    console.log(`Checking if user ${userId} has joined tournament ${tournamentId}`);
    
    // Check localStorage as a fallback
    const joinedTournaments = JSON.parse(localStorage.getItem('joinedTournaments') || '[]');
    return joinedTournaments.includes(tournamentId);
  } catch (error) {
    console.error('Error checking joined tournaments:', error);
    return false;
  }
};

/**
 * Get the current active tournament ID for a specific game
 * @param gameType Type of game ('slots' or 'quiz')
 * @returns Tournament ID if found, null otherwise
 */
export const getCurrentTournament = async (gameType: 'slots' | 'quiz'): Promise<string | null> => {
  try {
    // First check localStorage for better performance
    const cachedId = localStorage.getItem(`current_${gameType}_tournament`);
    if (cachedId) return cachedId;
    
    // In a production app, this would query the tournaments table
    // For now, return a mock tournament ID based on the game type
    if (gameType === 'slots') {
      return 'slot-daily-' + nanoid(6);
    } else {
      return 'quiz-daily-' + nanoid(6);
    }
  } catch (error) {
    console.error('Error getting current tournament:', error);
    return null;
  }
};
