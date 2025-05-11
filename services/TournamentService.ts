
// Tournament service for handling tournament-related operations

import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';

// Re-export everything from the tournaments module
export * from '@/services/tournaments/types';
export * from '@/services/tournaments/formatters';
export * from '@/services/tournaments/tournamentGenerator';
export * from '@/services/tournaments/tournamentActions';
export * from '@/services/tournaments/tournamentLeaderboard';

// Add explicit named export for backwards compatibility
export { getActiveTournaments as generateTournaments } from '@/services/tournaments/tournamentGenerator';

/**
 * Submits a score to a tournament leaderboard
 * @param tournamentId Unique tournament identifier
 * @param userId User ID submitting the score
 * @param score Score to submit
 */
export const submitTournamentScore = async (
  tournamentId: string,
  userId: string,
  score: number
): Promise<void> => {
  try {
    console.log(`Submitting score ${score} for user ${userId} to tournament ${tournamentId}`);
    
    // In a production app, we would update this in Supabase
    // For now, log the submission
    
    // Example implementation with Supabase:
    // const { error } = await supabase
    //   .from('tournament_entries')
    //   .upsert({
    //     tournament_id: tournamentId,
    //     user_id: userId,
    //     score: score,
    //     entry_date: new Date().toISOString()
    //   });
    
    // if (error) throw error;
  } catch (error) {
    console.error('Error submitting tournament score:', error);
  }
};

/**
 * Gets the current tournament leaderboard
 * @param tournamentId Tournament to get leaderboard for
 * @returns Array of tournament entries sorted by score
 */
export const getTournamentLeaderboard = async (
  tournamentId: string
): Promise<any[]> => {
  try {
    // In a production app, we would fetch this from Supabase
    // For now, return mock data
    
    // Example implementation with Supabase:
    // const { data, error } = await supabase
    //   .from('tournament_entries')
    //   .select('user_id, score, entry_date')
    //   .eq('tournament_id', tournamentId)
    //   .order('score', { ascending: false })
    //   .limit(100);
    
    // if (error) throw error;
    // return data || [];
    
    return [
      {
        id: nanoid(),
        user_id: 'user-1',
        tournament_id: tournamentId,
        score: 1250,
        username: 'HighRoller',
        entry_date: new Date().toISOString()
      },
      {
        id: nanoid(),
        user_id: 'user-2',
        tournament_id: tournamentId,
        score: 980,
        username: 'LuckyDraw',
        entry_date: new Date().toISOString()
      },
      {
        id: nanoid(),
        user_id: 'user-3',
        tournament_id: tournamentId,
        score: 720,
        username: 'SlotMaster',
        entry_date: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error fetching tournament leaderboard:', error);
    return [];
  }
};

/**
 * Joins a tournament
 * @param tournamentId Tournament to join
 * @param userId User who is joining
 */
export const joinTournament = async (
  tournamentId: string,
  userId: string
): Promise<boolean> => {
  try {
    console.log(`User ${userId} joining tournament ${tournamentId}`);
    
    // In a production app, we would update this in Supabase
    // For now, log the join
    
    // Example implementation with Supabase:
    // const { error } = await supabase
    //   .from('tournament_participants')
    //   .upsert({
    //     tournament_id: tournamentId,
    //     user_id: userId,
    //     joined_at: new Date().toISOString()
    //   });
    
    // if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error joining tournament:', error);
    return false;
  }
};
