
import React from 'react';
import { Loader2 } from 'lucide-react';
import TournamentCard from './TournamentCard';
import { Tournament } from '@/services/tournaments';
import { formatTimeLeft } from '@/services/tournaments';

interface TournamentListProps {
  tournaments: Array<Tournament & { joined?: boolean }>;
  loading: boolean;
  activeTab: 'all' | 'slots' | 'quiz';
  onJoinTournament: (tournamentId: string) => Promise<void>;
  onViewLeaderboard: (tournamentId: string) => void;
}

const TournamentList: React.FC<TournamentListProps> = ({
  tournaments,
  loading,
  activeTab,
  onJoinTournament,
  onViewLeaderboard
}) => {
  const filteredTournaments = tournaments.filter(tournament => {
    if (activeTab === 'all') return true;
    return tournament.game === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  if (filteredTournaments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No tournaments available at the moment. 
          Please check back later or contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {filteredTournaments.map(tournament => (
        <TournamentCard
          key={tournament.id}
          id={tournament.id}
          title={tournament.title}
          description={tournament.description}
          prizePool={tournament.prizePool}
          participants={tournament.participants}
          timeLeft={formatTimeLeft(tournament.endTime)}
          game={tournament.game}
          type={tournament.type}
          style={tournament.style}
          isActive={tournament.isActive}
          winners={tournament.winners}
          isJoined={tournament.joined}
          onJoin={() => onJoinTournament(tournament.id)}
          onViewLeaderboard={() => onViewLeaderboard(tournament.id)}
        />
      ))}
    </div>
  );
};

export default TournamentList;
