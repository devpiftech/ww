
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Calendar, Users } from 'lucide-react';
import { generateTournaments, joinTournament } from '@/services/tournaments';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface SlotTournamentsProps {
  machineType: string;
}

const SlotTournaments: React.FC<SlotTournamentsProps> = ({ machineType }) => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setLoading(true);
        const allTournaments = await generateTournaments();
        
        // Filter slot tournaments
        const slotTournaments = allTournaments.filter(t => 
          t.game === 'slots' && t.isActive
        );
        
        // Mark tournaments the user has already joined
        if (user) {
          const joinedTournaments = slotTournaments.map(t => ({
            ...t,
            joined: Math.random() > 0.5 // Simulate already joined status
          }));
          setTournaments(joinedTournaments);
        } else {
          setTournaments(slotTournaments);
        }
      } catch (error) {
        console.error('Error loading tournaments:', error);
        toast.error('Failed to load tournaments');
      } finally {
        setLoading(false);
      }
    };
    
    loadTournaments();
  }, [user]);
  
  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) {
      toast.error('You must be logged in to join tournaments');
      return;
    }
    
    try {
      const success = await joinTournament(tournamentId, user.id);
      
      if (success) {
        // Update UI to show user has joined
        setTournaments(prev => 
          prev.map(t => t.id === tournamentId ? {...t, joined: true} : t)
        );
        
        toast.success('You have joined the tournament!', {
          description: 'Your gameplay will now count toward this tournament.'
        });
      }
    } catch (error) {
      console.error('Error joining tournament:', error);
      toast.error('Failed to join tournament');
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-2 p-4 bg-background/10 rounded-lg animate-pulse">
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="h-20 bg-muted rounded"></div>
        <div className="h-20 bg-muted rounded"></div>
      </div>
    );
  }
  
  if (tournaments.length === 0) {
    return (
      <Card className="p-4 text-center">
        <Trophy className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <p>No active tournaments available</p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <Trophy className="h-5 w-5 text-casino-gold" />
        Active Tournaments
      </h3>
      
      {tournaments.map(tournament => (
        <Card key={tournament.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-base">{tournament.title}</h4>
              <p className="text-sm text-muted-foreground">{tournament.description}</p>
            </div>
            <div className="bg-casino-purple/20 px-2 py-1 rounded-full text-sm">
              <span className="text-casino-gold font-medium">{tournament.type}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 my-3 text-sm">
            <div className="flex flex-col items-center bg-background/20 p-2 rounded">
              <Award className="h-4 w-4 mb-1 text-casino-gold" />
              <span className="text-xs text-muted-foreground">Prize</span>
              <span className="font-medium">{tournament.prizePool.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center bg-background/20 p-2 rounded">
              <Calendar className="h-4 w-4 mb-1 text-casino-gold" />
              <span className="text-xs text-muted-foreground">Ends In</span>
              <span className="font-medium">24h</span>
            </div>
            <div className="flex flex-col items-center bg-background/20 p-2 rounded">
              <Users className="h-4 w-4 mb-1 text-casino-gold" />
              <span className="text-xs text-muted-foreground">Players</span>
              <span className="font-medium">{tournament.participants}</span>
            </div>
          </div>
          
          <Button 
            className="w-full casino-btn-secondary" 
            size="sm"
            onClick={() => handleJoinTournament(tournament.id)}
            disabled={tournament.joined}
          >
            {tournament.joined ? 'Participating' : 'Join Tournament'}
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default SlotTournaments;
