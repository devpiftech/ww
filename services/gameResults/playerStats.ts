
import { supabase } from '@/integrations/supabase/client';

// Get a player's stats for a game
export const getPlayerGameStats = async (userId: string, game: string): Promise<any> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('game_results')
      .select('*')
      .eq('user_id', userId)
      .eq('game', game);
      
    if (error) {
      console.error('Error fetching player game stats:', error);
      return null;
    }
    
    // Calculate summary statistics
    const gamesPlayed = data.length;
    const gamesWon = data.filter(r => r.is_win).length;
    const totalBet = data.reduce((sum, r) => sum + r.bet_amount, 0);
    const totalWon = data.reduce((sum, r) => sum + r.win_amount, 0);
    const netProfit = totalWon - totalBet;
    const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;
    const biggestWin = data.length > 0 ? Math.max(...data.map(r => r.win_amount)) : 0;
    
    return {
      gamesPlayed,
      gamesWon,
      totalBet,
      totalWon,
      netProfit,
      winRate,
      biggestWin,
      recentResults: data.slice(0, 10) // Last 10 games
    };
  } catch (error) {
    console.error('Error calculating player game stats:', error);
    return null;
  }
};


// ✅ Get global user balances from the 'profiles' table
export const getUserBalances = async (userId: string) => {
  if (!userId) return { coins: 0, sweeps: 0, free_spins: 0 };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('coins, sweeps, free_spins')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching balances:", error);
      return { coins: 0, sweeps: 0, free_spins: 0 };
    }

    return data;
  } catch (err) {
    console.error("Unexpected error fetching balances:", err);
    return { coins: 0, sweeps: 0, free_spins: 0 };
  }
};
