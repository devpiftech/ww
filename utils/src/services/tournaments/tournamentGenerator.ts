import { Tournament } from './types';
import { nanoid } from 'nanoid';

/**
 * Gets tournament details
 * @param tournamentId Optional tournament ID to fetch specific tournament
 * @returns Tournament details or array of all tournaments
 */
export const getTournamentDetails = async (tournamentId?: string): Promise<Tournament | Tournament[]> => {
  try {
    // In a production app, this would be fetched from Supabase
    const tournaments = await getActiveTournaments();
    
    // If tournament ID is provided, return that specific tournament
    if (tournamentId) {
      const tournament = tournaments.find(t => t.id === tournamentId);
      return tournament || tournaments[0]; // Return first tournament as fallback
    }
    
    // Otherwise return all tournaments
    return tournaments;
  } catch (error) {
    console.error('Error fetching tournament details:', error);
    return [];
  }
};

/**
 * Gets all currently active tournaments
 * @returns Array of active tournaments
 */
export const getActiveTournaments = async (): Promise<Tournament[]> => {
  // In a production app, this would be fetched from Supabase
  // For now, return mock data
  
  const now = new Date();
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);
  
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
  
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return [
    {
      id: 'slot-daily-' + nanoid(6),
      title: 'Daily Slots Tournament',
      description: 'Win the highest amount in a single spin',
      prizePool: 10000,
      participants: 124,
      endTime: dayEnd,
      game: 'slots',
      type: 'daily',
      style: 'standard',
      isActive: true
    },
    {
      id: 'slot-weekly-' + nanoid(6),
      title: 'Weekly Slots Championship',
      description: 'Accumulate the highest winnings over the week',
      prizePool: 50000,
      participants: 532,
      endTime: weekEnd,
      game: 'slots',
      type: 'weekly',
      style: 'premium',
      isActive: true
    },
    {
      id: 'quiz-daily-' + nanoid(6),
      title: 'Daily Quiz Challenge',
      description: 'Get the highest score in today\'s quiz',
      prizePool: 5000,
      participants: 87,
      endTime: dayEnd,
      game: 'quiz',
      type: 'daily',
      style: 'seasonal',
      isActive: true
    },
    {
      id: 'slots-monthly-' + nanoid(6),
      title: 'Monthly Jackpot Challenge',
      description: 'Compete for the biggest jackpot of the month',
      prizePool: 100000,
      participants: 875,
      endTime: monthEnd,
      game: 'slots',
      type: 'monthly',
      style: 'championship',
      isActive: true
    },
    {
      id: 'quiz-weekly-' + nanoid(6),
      title: 'Weekly Knowledge Cup',
      description: 'Test your knowledge against the best',
      prizePool: 25000,
      participants: 342,
      endTime: weekEnd,
      game: 'quiz',
      type: 'weekly',
      style: 'premium',
      isActive: true
    }
  ];
};
