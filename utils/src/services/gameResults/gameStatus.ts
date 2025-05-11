
// Service to check and update game status

import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a specific game is enabled by the admin
 * @param gameId Game identifier
 * @returns boolean indicating if game is enabled
 */
export const isGameEnabled = async (gameId: string): Promise<boolean> => {
  try {
    // In a production app, we would fetch this from Supabase
    // For now, return true for all games
    return true;
    
    // Example implementation with Supabase:
    // const { data, error } = await supabase
    //   .from('game_settings')
    //   .select('enabled')
    //   .eq('game_id', gameId)
    //   .single();
    
    // if (error) throw error;
    // return data?.enabled ?? false;
  } catch (error) {
    console.error(`Error checking if game ${gameId} is enabled:`, error);
    // Default to enabled if there's an error
    return true;
  }
};

/**
 * Updates a game's enabled status
 * @param gameId Game identifier
 * @param enabled New enabled status
 */
export const setGameEnabled = async (gameId: string, enabled: boolean): Promise<void> => {
  try {
    // In a production app, we would update this in Supabase
    console.log(`Setting game ${gameId} enabled status to: ${enabled}`);
    
    // Example implementation with Supabase:
    // const { error } = await supabase
    //   .from('game_settings')
    //   .upsert({ game_id: gameId, enabled: enabled, updated_at: new Date().toISOString() });
    
    // if (error) throw error;
  } catch (error) {
    console.error(`Error updating enabled status for game ${gameId}:`, error);
    throw error;
  }
};
