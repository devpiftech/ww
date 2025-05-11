
import { supabase } from "@/integrations/supabase/client";
import { GameResult } from "./types";
import { updateTournamentScore } from "./tournamentIntegration";

/**
 * Records a game result to the database
 * @param result The game result to record
 */
export const recordGameResult = async (result: GameResult): Promise<void> => {
  try {
    console.log('Recording game result:', result);
    
    // In a production app, we would save this to Supabase
    // For now, just log it
    
    // Example implementation with Supabase:
    // const { error } = await supabase
    //   .from('game_results')
    //   .insert({
    //     user_id: result.user_id,
    //     game: result.game,
    //     bet_amount: result.bet_amount,
    //     win_amount: result.win_amount,
    //     is_win: result.is_win,
    //     game_data: result.game_data || {}
    //   });
    
    // if (error) throw error;
    
    // If this was a win, update tournaments and user stats
    if (result.is_win && result.win_amount > 0) {
      // Update tournaments
      await updateTournamentScore(result);
      
      // In a real implementation we would also update user stats here
      console.log(`User ${result.user_id} won ${result.win_amount}!`);
    }
  } catch (error) {
    console.error('Error recording game result:', error);
  }
};
