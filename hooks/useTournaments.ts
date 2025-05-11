
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getActiveTournaments, 
  joinTournament, 
  Tournament,
  hasJoinedTournament
} from '@/services/tournaments';
import { supabase } from '@/integrations/supabase/client';

export const useTournaments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'slots' | 'quiz'>('all');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadTournaments = async () => {
      setLoading(true);
      try {
        // First, try to generate tournaments if needed
        try {
          await fetch('https://enrjmivxwhkwticwdqmi.supabase.co/functions/v1/generate-tournaments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVucmptaXZ4d2hrd3RpY3dkcW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzU2NTAsImV4cCI6MjA2MTgxMTY1MH0.9CkLxze4gMQ5YXJqa8zFYYmj_k4sy1sx05Wttq8w3FA`
            }
          });
        } catch (error) {
          console.error('Error generating tournaments:', error);
          // Continue even if tournament generation fails
        }
        
        // Then load tournaments
        const tournamentData = await getActiveTournaments();
        
        // Mark tournaments as joined if the user has already joined them
        if (user) {
          const tournamentsWithJoinStatus = await Promise.all(
            tournamentData.map(async (tournament) => {
              const joined = await hasJoinedTournament(tournament.id, user.id);
              return { ...tournament, joined };
            })
          );
          setTournaments(tournamentsWithJoinStatus);
        } else {
          setTournaments(tournamentData);
        }
      } catch (error) {
        console.error('Error loading tournaments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTournaments();
    
    // Refresh tournaments every minute to update time remaining
    const interval = setInterval(loadTournaments, 60000);
    return () => clearInterval(interval);
  }, [user]);
  
  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const success = await joinTournament(tournamentId, user?.id);
    
    // Update local state to mark this tournament as joined
    if (success) {
      setTournaments(prevTournaments => 
        prevTournaments.map(t => 
          t.id === tournamentId ? { ...t, joined: true } : t
        )
      );
      
      // If this is a quiz tournament, navigate to the quiz page
      const tournament = tournaments.find(t => t.id === tournamentId);
      if (tournament && tournament.game === 'quiz') {
        navigate('/quiz');
      }
      
      // If this is a slots tournament, navigate to the slots page
      if (tournament && tournament.game === 'slots') {
        navigate('/slots');
      }
    }
  };
  
  const handleViewLeaderboard = (tournamentId: string) => {
    navigate(`/leaderboard?tournament=${tournamentId}`);
  };

  return {
    tournaments,
    loading,
    activeTab,
    setActiveTab,
    handleJoinTournament,
    handleViewLeaderboard
  };
};
