
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SportEvent } from '@/types/slots';
import { format } from 'date-fns';
import { Activity, Play, Target, Dices, GanttChart, Trophy } from 'lucide-react';

interface LiveEventsProps {
  events: SportEvent[];
  onPlaceBet: (event: SportEvent, betType: string, odds: number) => void;
  currency: 'waynebucks' | 'waynesweeps';
}

const LiveEvents: React.FC<LiveEventsProps> = ({ events, onPlaceBet, currency }) => {
  const liveEvents = events.filter(event => event.status === 'live');
  
  // Maps a sport to its icon based on the league name
  const getSportIcon = (league: string) => {
    const leagueLC = league?.toLowerCase() || '';
    
    if (leagueLC.includes('soccer') || 
        leagueLC.includes('premier') || 
        leagueLC.includes('liga') || 
        (leagueLC.includes('football') && !leagueLC.includes('american')))
      return <Target className="text-green-500" />;
      
    if (leagueLC.includes('basketball') || leagueLC.includes('nba'))
      return <Activity className="text-orange-500" />;
      
    if (leagueLC.includes('baseball') || leagueLC.includes('mlb'))
      return <Dices className="text-blue-500" />;
      
    if (leagueLC.includes('nfl') || leagueLC.includes('american football'))
      return <GanttChart className="text-red-500" />;
      
    if (leagueLC.includes('tennis') || leagueLC.includes('atp') || leagueLC.includes('wta'))
      return <Play className="text-purple-500" />;
      
    return <Activity className="text-gray-500" />;
  };
  
  // Format the time relative to now (e.g., "30 minutes ago")
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMs = Math.abs(new Date().getTime() - date.getTime());
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
  };
  
  const calculateLiveOdds = (event: SportEvent) => {
    if (!event.homeScore || !event.awayScore) return { home: 1.9, draw: 3.5, away: 2.1 };
    
    const scoreDiff = event.homeScore - event.awayScore;
    let homeOdds = 1.9;
    let drawOdds = 3.5;
    let awayOdds = 2.1;
    
    // Adjust odds based on score difference
    if (scoreDiff > 0) {
      // Home team leading
      homeOdds = Math.max(1.2, 1.9 - (scoreDiff * 0.2));
      awayOdds = Math.min(4.5, 2.1 + (scoreDiff * 0.5));
    } else if (scoreDiff < 0) {
      // Away team leading
      awayOdds = Math.max(1.2, 2.1 - (Math.abs(scoreDiff) * 0.2));
      homeOdds = Math.min(4.5, 1.9 + (Math.abs(scoreDiff) * 0.5));
    }
    
    return { home: homeOdds, draw: drawOdds, away: awayOdds };
  };
  
  if (liveEvents.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Badge variant="destructive" className="animate-pulse mr-2">LIVE</Badge>
            Live Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-8">
            No live events at the moment. Check back later!
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Badge variant="destructive" className="animate-pulse mr-2">LIVE</Badge>
          Live Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {liveEvents.map(event => {
            const odds = calculateLiveOdds(event);
            const minutesPlayed = Math.floor((new Date().getTime() - new Date(event.startTime).getTime()) / 60000);
            
            return (
              <Card key={event.id} className="overflow-hidden border-l-4 border-l-red-500 animate-pulse-subtle">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-3">
                      <div className="flex items-center">
                        {getSportIcon(event.league)}
                        <span className="text-xs text-muted-foreground ml-1">{event.league}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-lg font-bold">{event.homeTeam}</div>
                        <div className="text-2xl font-bold text-primary">{event.homeScore}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold">{event.awayTeam}</div>
                        <div className="text-2xl font-bold text-primary">{event.awayScore}</div>
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">
                          {minutesPlayed}'
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          Started {formatRelativeTime(event.startTime)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex flex-col gap-2 justify-center">
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex flex-col items-center transition-all hover:bg-primary hover:text-primary-foreground"
                          onClick={() => onPlaceBet(event, 'home', odds.home)}
                        >
                          <span className="text-xs">1</span>
                          <span className="font-bold">{odds.home.toFixed(2)}</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex flex-col items-center transition-all hover:bg-primary hover:text-primary-foreground"
                          onClick={() => onPlaceBet(event, 'draw', odds.draw)}
                        >
                          <span className="text-xs">X</span>
                          <span className="font-bold">{odds.draw.toFixed(2)}</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex flex-col items-center transition-all hover:bg-primary hover:text-primary-foreground"
                          onClick={() => onPlaceBet(event, 'away', odds.away)}
                        >
                          <span className="text-xs">2</span>
                          <span className="font-bold">{odds.away.toFixed(2)}</span>
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        +12 more bets
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveEvents;
