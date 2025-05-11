
import { supabase } from '@/integrations/supabase/client';
import { TournamentLeaderboardResponse, LeaderboardEntry, UserTournamentStandingResponse } from '../types/supabaseTypes';
import { nanoid } from 'nanoid';

/**
 * Gets the leaderboard for a specific tournament
 * @param tournamentId ID of the tournament
 * @returns Array of leaderboard entries
 */
export const getTournamentLeaderboard = async (tournamentId: string): Promise<LeaderboardEntry[]> => {
  try {
    // In a production app, this would use the get_tournament_leaderboard RPC function
    // For now, return mock data
    const { data, error } = await supabase.rpc(
      'get_tournament_leaderboard_data',
      { tournament_id: tournamentId }
    );
    
    if (error) throw error;
    
    // Process the response into LeaderboardEntry[]
    return (data as TournamentLeaderboardResponse[]).map((entry, index) => ({
      id: entry.id || `entry-${index}-${nanoid(6)}`,
      rank: entry.rank || index + 1,
      username: entry.username || `Player${index + 1}`,
      avatar_url: entry.avatar_url || undefined,
      score: entry.score || 0,
      winnings: entry.score || 0,
      isPlayer: false,
      user_id: entry.user_id // Ensure user_id is included from the response
    }));
  } catch (error) {
    console.error('Error getting tournament leaderboard:', error);
    return generateMockLeaderboard(tournamentId);
  }
};

/**
 * Gets the user's standing in a specific tournament
 * @param tournamentId ID of the tournament
 * @param userId ID of the user
 * @returns User standing object
 */
export const getUserTournamentStanding = async (tournamentId: string, userId: string): Promise<UserTournamentStandingResponse> => {
  try {
    const { data, error } = await supabase.rpc(
      'get_user_tournament_standing',
      {
        tournament_id: tournamentId,
        user_id: userId
      }
    );
    
    if (error) throw error;
    
    // Return the first item if it's an array
    if (Array.isArray(data) && data.length > 0) {
      return {
        rank: data[0].rank,
        score: data[0].score
      };
    }
    
    // If it's already the right shape, return it
    if (data && typeof data === 'object' && 'rank' in data && 'score' in data) {
      return data as UserTournamentStandingResponse;
    }
    
    // Fallback
    return { rank: 0, score: 0 };
  } catch (error) {
    console.error('Error getting user tournament standing:', error);
    return { rank: 0, score: 0 };
  }
};

/**
 * Generate mock leaderboard data for development
 * @param tournamentId Tournament ID
 * @returns Mock leaderboard entries
 */
function generateMockLeaderboard(tournamentId: string): LeaderboardEntry[] {
  const playerCount = 20;
  const entries: LeaderboardEntry[] = [];
  
  for (let i = 0; i < playerCount; i++) {
    const rank = i + 1;
    const score = Math.floor((playerCount - i) * 100 + Math.random() * 50);
    const userId = `user-${i}-${nanoid(6)}`;
    const entry: LeaderboardEntry = {
      id: userId,
      user_id: userId, // Add user_id to match the LeaderboardEntry type
      rank,
      username: `Player${rank}`,
      avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=player${rank}`,
      score,
      winnings: score
    };
    entries.push(entry);
  }
  
  return entries;
}
