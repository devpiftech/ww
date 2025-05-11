
import { useEffect } from 'react';
import { SlotMachineState } from '@/types/slots';
import { recordGameResult, isGameEnabled } from '@/services/gameResults';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { submitTournamentScore } from '@/services/TournamentService';

interface UseSlotMachineTrackingProps {
  state: SlotMachineState;
  machineName: string;
  reels: number;
  rows: number;
}

export const useSlotMachineTracking = ({
  state,
  machineName,
  reels,
  rows
}: UseSlotMachineTrackingProps) => {
  const { user } = useAuth();
  
  // Check if the slot machine is enabled
  useEffect(() => {
    // Check if this slot machine is enabled in admin settings
    const checkIfEnabled = async () => {
      const gameId = `slot-${machineName.toLowerCase().replace(/\s+/g, '-')}`;
      const enabled = await isGameEnabled(gameId);
      
      if (!enabled) {
        toast.error(`${machineName} is currently disabled by the casino`, {
          description: "Please try another game or check back later.",
          duration: 5000
        });
      }
    };
    
    checkIfEnabled();
  }, [machineName]);
  
  // Record loss to database when user spins and doesn't win
  useEffect(() => {
    if (!state.spinning && state.lastWin === 0 && user && state.betAmount > 0) {
      // Only record when not in free spin mode
      if (state.freeSpins === 0) {
        recordGameResult({
          user_id: user.id,
          game: `slot-${machineName.toLowerCase().replace(/\s+/g, '-')}`,
          bet_amount: state.betAmount,
          win_amount: 0,
          is_win: false,
          game_data: {
            reels: reels,
            rows: rows
          }
        });
      }
    }
  }, [state.spinning, state.lastWin, state.betAmount, user, machineName, reels, rows, state.freeSpins]);

  // Function to track win events
  const trackWin = (amount: number) => {
    // Record win to database
    if (user && amount > 0) {
      recordGameResult({
        user_id: user.id,
        game: `slot-${machineName.toLowerCase().replace(/\s+/g, '-')}`,
        bet_amount: state.betAmount,
        win_amount: amount,
        is_win: true,
        game_data: {
          reels: reels,
          rows: rows,
          multiplier: state.multiplier,
          freeSpins: state.freeSpins > 0
        }
      });
      
      // Submit win to tournament
      submitTournamentScore(
        `slot-daily-tournament`, 
        user.id,
        amount
      );
    }
  };
  
  return {
    trackWin
  };
};
