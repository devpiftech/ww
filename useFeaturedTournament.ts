
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  generateTournaments, 
  joinTournament, 
  Tournament
} from '@/services/tournaments';

export const useFeaturedTournament = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featuredTournament, setFeaturedTournament] = useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  
  useEffect(() => {
    // Fetch tournaments and select a featured one
    const loadTournaments = async () => {
      try {
        const allTournaments = await generateTournaments();
        setTournaments(allTournaments);
        
        // Get weekly tournaments as featured
        const weeklyTournaments = allTournaments.filter(t => t.type === 'weekly');
        
        if (weeklyTournaments.length > 0) {
          setFeaturedTournament(weeklyTournaments[0]);
        } else if (allTournaments.length > 0) {
          setFeaturedTournament(allTournaments[0]);
        }
      } catch (error) {
        console.error('Error loading tournaments:', error);
      }
    };
    
    loadTournaments();
  }, []);
  
  const handleJoinTournament = async () => {
    if (!featuredTournament) return;
    
    const success = await joinTournament(featuredTournament.id, user?.id || null);
    
    if (success) {
      if (featuredTournament.game === 'slots') {
        navigate('/slots');
      } else if (featuredTournament.game === 'quiz') {
        navigate('/quiz');
      }
    }
  };
  
  return {
    featuredTournament,
    tournaments,
    handleJoinTournament
  };
};
