
import React from 'react';
import Layout from '@/components/Layout';
import TournamentHeader from '@/components/tournaments/TournamentHeader';
import TournamentTabs from '@/components/tournaments/TournamentTabs';
import TournamentList from '@/components/tournaments/TournamentList';
import { useTournaments } from '@/hooks/useTournaments';

const Tournaments: React.FC = () => {
  const {
    tournaments,
    loading,
    activeTab,
    setActiveTab,
    handleJoinTournament,
    handleViewLeaderboard
  } = useTournaments();
  
  return (
    <Layout>
      <TournamentHeader 
        title="Tournaments" 
        subtitle="Compete against other players for big prizes!" 
      />
      
      <TournamentTabs 
        activeTab={activeTab} 
        onTabChange={(value) => setActiveTab(value as 'all' | 'slots' | 'quiz')}
      >
        <TournamentList 
          tournaments={tournaments}
          loading={loading}
          activeTab={activeTab}
          onJoinTournament={handleJoinTournament}
          onViewLeaderboard={handleViewLeaderboard}
        />
      </TournamentTabs>
    </Layout>
  );
};

export default Tournaments;
