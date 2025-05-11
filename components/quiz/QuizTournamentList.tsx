
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Calendar, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Tournament, formatTimeLeft } from '@/services/tournaments';
import { useAuth } from '@/context/AuthContext';

interface QuizTournamentListProps {
  tournaments: Tournament[];
  onJoinTournament: (tournamentType: string) => void;
}

const QuizTournamentList: React.FC<QuizTournamentListProps> = ({ 
  tournaments,
  onJoinTournament
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleJoinTournament = (tournamentType: string) => {
    if (!user) {
      toast.error('You must be logged in to join tournaments');
      return;
    }

    onJoinTournament(tournamentType);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tournaments.map((tournament) => (
        <Card key={tournament.id} className="casino-card">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{tournament.title}</h3>
                  {tournament.type === 'weekly' && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Weekly</span>
                  )}
                  {tournament.type === 'monthly' && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">Monthly</span>
                  )}
                  {tournament.type === 'daily' && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Daily</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 mb-4">{tournament.description}</p>
              </div>
              
              {tournament.type === 'weekly' ? (
                <Calendar className="h-10 w-10 text-casino-gold" />
              ) : tournament.type === 'monthly' ? (
                <Trophy className="h-10 w-10 text-casino-gold" />
              ) : (
                <Award className="h-10 w-10 text-casino-gold" />
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="bg-muted/20 px-3 py-2 rounded-lg">
                <p className="text-xs text-muted-foreground">Prize Pool</p>
                <p className="text-lg font-bold text-casino-gold">{tournament.prizePool.toLocaleString()} Coins</p>
              </div>
              
              <div className="bg-muted/20 px-3 py-2 rounded-lg">
                <p className="text-xs text-muted-foreground">Participants</p>
                <p className="text-lg font-bold">{tournament.participants} Players</p>
              </div>
              
              <div className="bg-muted/20 px-3 py-2 rounded-lg">
                <p className="text-xs text-muted-foreground">Time Left</p>
                <p className="text-lg font-bold text-casino-red">{formatTimeLeft(tournament.endTime)}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="casino-btn flex-1" 
                onClick={() => handleJoinTournament(tournament.type)}
              >
                Join Tournament
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/leaderboard')}
              >
                View Leaderboard
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default QuizTournamentList;
