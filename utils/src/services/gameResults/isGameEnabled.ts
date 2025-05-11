
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if a game is enabled in the admin settings
 * @param gameId The ID of the game to check
 * @returns Boolean indicating if the game is enabled
 */
export const isGameEnabled = async (gameId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('game_configs')
      .select('enabled')
      .eq('id', gameId)
      .single();
      
    if (error) {
      console.error('Error checking if game is enabled:', error);
      return true; // Default to enabled if there's an error
    }
    
    return data?.enabled ?? true;
  } catch (error) {
    console.error('Error in isGameEnabled:', error);
    return true; // Default to enabled if there's an error
  }
};
