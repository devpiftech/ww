
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import WelcomeBanner from '@/components/home/WelcomeBanner';
import NoticeBar from '@/components/home/NoticeBar';
import FeaturedGames from '@/components/home/FeaturedGames';
import FeaturedTournament from '@/components/home/FeaturedTournament';
import { useFeaturedTournament } from '@/hooks/useFeaturedTournament';
import CurrencySelector from '@/components/CurrencySelector';

const Index: React.FC = () => {
  const [showNotice, setShowNotice] = useState(true);
  const { featuredTournament, handleJoinTournament } = useFeaturedTournament();
  
  return (
    <Layout>
      {/* Welcome Banner */}
      <WelcomeBanner />
      
      {/* Notice Banner */}
      <NoticeBar 
        showNotice={showNotice} 
        onDismiss={() => setShowNotice(false)} 
      />
      
      {/* Currency Selector */}
      <div className="flex justify-end mb-4">
        <CurrencySelector />
      </div>
      
      {/* Featured Games */}
      <FeaturedGames />
      
      {/* Tournaments */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Active Tournaments</h2>
          <a href="/tournaments" className="text-casino-gold underline hover:text-casino-gold/80">
            View All Tournaments
          </a>
        </div>
        
        <FeaturedTournament 
          tournament={featuredTournament}
          onJoinTournament={handleJoinTournament}
        />
      </section>
    </Layout>
  );
};

export default Index;
