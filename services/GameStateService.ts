import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { recordGameResult } from '@/services/gameResults';

// Interface for game transaction
export interface GameTransaction {
  userId: string | null;
  gameId: string;
  amount: number;
  type: 'bet' | 'win' | 'refund';
  metadata?: Record<string, any>;
}

// Process a bet
export const processBet = async (
  user: User | null,
  gameId: string,
  betAmount: number,
  metadata?: Record<string, any>
): Promise<boolean> => {
  if (!user) {
    toast.error('You must be logged in to place a bet');
    return false;
  }
  
  if (betAmount <= 0) {
    toast.error('Bet amount must be greater than zero');
    return false;
  }
  
  try {
    // Check if user has enough balance
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();
      
    if (userError || !userData) {
      console.error('Error checking user balance:', userError);
      toast.error('Could not verify your balance');
      return false;
    }
    
    if (userData.balance < betAmount) {
      toast.error('Not enough coins to place this bet');
      return false;
    }
    
    // Process the transaction
    const { data, error } = await supabase.rpc('update_balance', {
      user_uuid: user.id,
      amount: -betAmount, // Negative for bets
      t_type: 'bet',
      game_name: gameId,
      meta: metadata || {}
    });
    
    if (error) {
      console.error('Error processing bet:', error);
      toast.error('Failed to place bet');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in processBet:', error);
    toast.error('Failed to process your bet');
    return false;
  }
};

// Process a win
export const processWin = async (
  user: User | null,
  gameId: string,
  winAmount: number,
  metadata?: Record<string, any>
): Promise<boolean> => {
  if (!user) {
    console.error('Cannot process win: No user provided');
    return false;
  }
  
  if (winAmount <= 0) {
    console.error('Win amount must be greater than zero');
    return false;
  }
  
  try {
    // Process the transaction
    const { data, error } = await supabase.rpc('update_balance', {
      user_uuid: user.id,
      amount: winAmount,
      t_type: 'win',
      game_name: gameId,
      meta: metadata || {}
    });
    
    if (error) {
      console.error('Error processing win:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in processWin:', error);
    return false;
  }
};

// Process a complete game round (bet and potential win)
export const processGameRound = async (
  user: User | null,
  gameId: string,
  betAmount: number,
  winAmount: number,
  isWin: boolean,
  gameData?: Record<string, any>
): Promise<boolean> => {
  if (!user) {
    toast.error('You must be logged in to play');
    return false;
  }
  
  try {
    // First, record the bet
    const betSuccess = await processBet(user, gameId, betAmount, gameData);
    if (!betSuccess) return false;
    
    // If there's a win, process it
    if (isWin && winAmount > 0) {
      const winSuccess = await processWin(user, gameId, winAmount, gameData);
      if (!winSuccess) return false;
    }
    
    // Record the game result for statistics and tournaments
    await recordGameResult({
      user_id: user.id,
      game: gameId,
      bet_amount: betAmount,
      win_amount: isWin ? winAmount : 0,
      is_win: isWin,
      game_data: gameData
    });
    
    return true;
  } catch (error) {
    console.error('Error processing game round:', error);
    toast.error('An error occurred while processing your game');
    return false;
  }
};

// Get updated balance
export const getUpdatedBalance = async (userId: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching updated balance:', error);
      return null;
    }
    
    return data?.balance || null;
  } catch (error) {
    console.error('Error in getUpdatedBalance:', error);
    return null;
  }
};
