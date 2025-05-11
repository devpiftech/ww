
import { nanoid } from 'nanoid';
import { GameResult } from './types';
import { submitTournamentScore } from '@/services/tournaments/tournamentActions';
import { startBotSimulation } from '@/services/bots';
import { getTournamentDetails } from '@/services/tournaments/tournamentGenerator';
import { BotSimulationConfig } from '../types/supabaseTypes';

/**
 * Update tournament scores when a player wins
 * @param result Game result
 */
export const updateTournamentScore = async (result: GameResult): Promise<void> => {
  try {
    // Determine which tournaments to update based on the game type
    let tournamentIdsToUpdate: string[] = [];
    
    // Find active tournaments that match this game
    const gameType = result.game.includes('slot') ? 'slots' : 
                    result.game === 'quiz' ? 'quiz' : null;
    
    if (!gameType) return; // Not a tournament game
    
    // Get actual active tournaments instead of using hardcoded IDs
    try {
      // Fetch active tournaments from the generator service
      const activeTournamentsData = await getTournamentDetails();
      const activeTournaments = Array.isArray(activeTournamentsData) ? activeTournamentsData : [activeTournamentsData];
      
      // Filter tournaments that match the game type
      tournamentIdsToUpdate = activeTournaments
        .filter(t => t.game === gameType && t.isActive)
        .map(t => t.id);
    } catch (error) {
      console.error('Error fetching active tournaments:', error);
      
      // Fallback to hardcoded IDs if tournament fetch fails
      if (gameType === 'slots') {
        tournamentIdsToUpdate.push(
          'slot-daily-' + nanoid(6), 
          'slot-weekly-' + nanoid(6)
        );
      } else if (gameType === 'quiz') {
        tournamentIdsToUpdate.push(
          'quiz-daily-' + nanoid(6), 
          'quiz-weekly-' + nanoid(6)
        );
      }
    }
    
    // Update scores for each relevant tournament
    for (const tournamentId of tournamentIdsToUpdate) {
      await submitTournamentScore(
        tournamentId,
        result.user_id || '',
        result.win_amount
      );
    }
    
    // Simulate bot activity in tournaments using the updated interface
    const botConfig: BotSimulationConfig = {
      id: 'tournament-activity-bots',
      enabled: true,
      bot_count: 3,
      min_bet: 5,
      max_bet: 25,
      min_wait: 10000,
      max_wait: 30000,
      games: [gameType === 'slots' ? 'slots' : 'quiz'],
      created_at: new Date().toISOString(),
      minBots: 1,
      maxBots: 3,
      joinFrequency: 60000,
      chatFrequency: 120000,
      leaveFrequency: 90000
    };
    
    startBotSimulation(botConfig);
  } catch (error) {
    console.error('Error updating tournament scores:', error);
  }
};
