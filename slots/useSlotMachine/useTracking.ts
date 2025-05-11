
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTracking = (slotType: string) => {
  // Track game results for analytics and history
  const trackGameResult = useCallback(async (betAmount: number, winAmount: number) => {
    try {
      // Save game result to database
      const { error } = await supabase.from('game_results').insert({
        game: `slot-${slotType}`,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        bet_amount: betAmount,
        win_amount: winAmount,
        is_win: winAmount > 0,
        game_data: {
          betAmount,
          winAmount,
          slotType
        }
      });

      if (error) {
        console.error('Failed to save game result', error);
      }
    } catch (err) {
      console.error('Error tracking game result', err);
    }
  }, [slotType]);

  return { trackGameResult };
};
