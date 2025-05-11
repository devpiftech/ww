
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Award, Star, Medal } from 'lucide-react';
import { Tournament, formatTimeLeft } from '@/services/tournaments';
import { Badge } from '@/components/ui/badge';

interface FeaturedTournamentProps {
  tournament: Tournament | null;
  onJoinTournament: () => void;
}

const FeaturedTournament: React.FC<FeaturedTournamentProps> = ({ 
  tournament, 
  onJoinTournament 
}) => {
  if (!tournament) {
    return (
      <div className="bg-card border border-border/30 rounded-lg p-6 shadow-xl text-center">
        <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">No Active Tournaments</h3>
        <p className="text-muted-foreground mb-4">Check back soon for new tournaments!</p>
        <Link to="/games">
          <Button className="casino-btn">
            Play Games Now
          </Button>
        </Link>
      </div>
    );
  }
  
  // Style-based icon
  const getTournamentIcon = () => {
    switch (tournament.style) {
      case 'premium':
        return <Star className="h-16 w-16 text-amber-500 animate-pulse-glow" />;
      case 'seasonal':
        return <Award className="h-16 w-16 text-emerald-500 animate-pulse-glow" />;
      case 'championship':
        return <Medal className="h-16 w-16 text-purple-500 animate-pulse-glow" />;
      default:
        return tournament.type === 'weekly' ? 
          <Calendar className="h-16 w-16 text-casino-gold animate-pulse-glow" /> : 
          <Trophy className="h-16 w-16 text-casino-gold animate-pulse-glow" />;
    }
  };
  
  // Style-based classes
  const getStyleClasses = () => {
    switch (tournament.style) {
      case 'premium':
        return "border-amber-500/30 bg-gradient-to-b from-card to-amber-950/10";
      case 'seasonal':
        return "border-emerald-500/30 bg-gradient-to-b from-card to-emerald-950/10";
      case 'championship':
        return "border-purple-500/30 bg-gradient-to-b from-card to-purple-950/10";
      default:
        return "border-border/30";
    }
  };
  
  // Style badge
  const getStyleBadge = () => {
    switch (tournament.style) {
      case 'premium':
        return (
          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Premium</span>
        );
      case 'seasonal':
        return (
          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">Seasonal</span>
        );
      case 'championship':
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Championship</span>
        );
      default:
        return null;
    }
  };
  
  // Style-based button
  const getStyleButton = () => {
    switch (tournament.style) {
      case 'premium':
        return "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white";
      case 'seasonal':
        return "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white";
      case 'championship':
        return "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white";
      default:
        return "casino-btn";
    }
  };
  
  return (
    <div className={`bg-card rounded-lg p-6 shadow-xl border ${getStyleClasses()}`}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          {getTournamentIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">{tournament.title}</h3>
            {tournament.type === 'weekly' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Weekly</span>
            )}
            {tournament.type === 'monthly' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Monthly</span>
            )}
            {tournament.type === 'daily' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Daily</span>
            )}
            {getStyleBadge()}
          </div>
          <p className="text-muted-foreground mb-4">{tournament.description}</p>
          
          <div className="flex flex-wrap gap-4">
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
        </div>
        
        <div className="flex-shrink-0">
          <Button 
            className={getStyleButton()}
            onClick={onJoinTournament}
          >
            Join Tournament
          </Button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-casino-gold" />
            <span className="text-sm font-semibold">Top 5 Winners Share {tournament.prizePool.toLocaleString()} Coins</span>
          </div>
          <Link to="/tournaments">
            <Button variant="ghost" size="sm">
              See All Tournaments
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedTournament;
