
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SportEvent } from '@/types/slots';
import { format } from 'date-fns';
import { Activity, Play, Target, Dices, GanttChart } from 'lucide-react';

interface UpcomingEventsProps {
  events: SportEvent[];
  activeCategoryId: string;
  onPlaceBet: (event: SportEvent, betType: string, odds: number) => void;
  currency: 'waynebucks' | 'waynesweeps';
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ 
  events, 
  activeCategoryId,
  onPlaceBet,
  currency
}) => {
  // Filter upcoming events by selected category
  const upcomingEvents = events
    .filter(event => event.status === 'scheduled')
    .filter(event => {
      // Match events to categories based on league name
      const league = event.league?.toLowerCase() || '';
      
      switch (activeCategoryId) {
        case 'soccer':
          return league.includes('soccer') || 
                 league.includes('football') && !league.includes('american') ||
                 league.includes('premier') || 
                 league.includes('liga');
        case 'basketball':
          return league.includes('basketball') || league.includes('nba');
        case 'baseball':
          return league.includes('baseball') || league.includes('mlb');
        case 'football':
          return league.includes('nfl') || league.includes('american football');
        case 'hockey':
          return league.includes('hockey') || league.includes('nhl');
        case 'tennis':
          return league.includes('tennis') || league.includes('atp') || league.includes('wta');
        default:
          return true;
      }
    });
  
  // Format the time relative to now (e.g., "in 30 minutes")
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMs = date.getTime() - new Date().getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `in ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
  };
  
  // Maps a sport to its icon
  const getSportIcon = (league: string) => {
    if (league.includes('Premier') || league.includes('Liga')) return <Target className="text-green-500" />;
    if (league.includes('NBA')) return <Activity className="text-orange-500" />;
    if (league.includes('MLB')) return <Dices className="text-blue-500" />;
    if (league.includes('NFL')) return <GanttChart className="text-red-500" />;
    if (league.includes('ATP') || league.includes('Tennis')) return <Play className="text-purple-500" />;
    return <Activity className="text-gray-500" />;
  };
  
  // Generate realistic odds based on the league and teams
  const calculateOdds = (event: SportEvent) => {
    // Base odds
    let homeOdds = 1.9;
    let drawOdds = 3.5;
    let awayOdds = 2.1;
    
    // Adjust based on league
    if (event.league.includes('Premier')) {
      if (event.homeTeam.includes('Manchester') || 
          event.homeTeam.includes('Liverpool') || 
          event.homeTeam.includes('Arsenal')) {
        homeOdds -= 0.3;
        awayOdds += 0.4;
      }
    }
    
    // Randomize slightly to make it more realistic
    homeOdds += (Math.random() - 0.5) * 0.2;
    drawOdds += (Math.random() - 0.5) * 0.3;
    awayOdds += (Math.random() - 0.5) * 0.2;
    
    return { home: homeOdds, draw: drawOdds, away: awayOdds };
  };
  
  if (upcomingEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-8">
            No upcoming events in this category. Please check other categories.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {upcomingEvents.map(event => {
            const odds = calculateOdds(event);
            
            return (
              <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-3">
                      <div className="flex items-center">
                        {getSportIcon(event.league)}
                        <span className="text-xs text-muted-foreground ml-1">{event.league}</span>
                      </div>
                      
                      <div className="mt-2 text-lg font-bold">{event.homeTeam} - {event.awayTeam}</div>
                      
                      <div className="flex items-center mt-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                          Upcoming
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          Starts {formatRelativeTime(event.startTime)}
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
                        +24 more bets
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

export default UpcomingEvents;
