
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import LeaderboardComponent from '@/components/Leaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { TournamentDetails } from '@/services/types/supabaseTypes';

const LeaderboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'all-time' | 'this-week' | 'today'>('all-time');
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get('tournament');
  const [tournamentDetails, setTournamentDetails] = useState<TournamentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (tournamentId) {
      fetchTournamentDetails(tournamentId);
    }
  }, [tournamentId]);
  
  const fetchTournamentDetails = async (id: string) => {
    setLoading(true);
    try {
      // Use our new get_tournament_details function
      const { data, error } = await supabase
        .rpc('get_tournament_details', {
          tournament_id: id
        });
      
      if (error) throw error;
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Convert to the expected type
        const tournamentData = data[0];
        setTournamentDetails(tournamentData as TournamentDetails);
      } else if (data && typeof data === 'object') {
        // Handle non-array response
        setTournamentDetails(data as TournamentDetails);
      }
    } catch (error) {
      console.error('Error fetching tournament details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (tournamentId) {
    return (
      <Layout>
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/tournaments')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tournaments
          </Button>
          
          <h1 className="text-3xl font-bold">Tournament Leaderboard</h1>
        </div>
        
        {tournamentDetails && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-casino-gold" />
                {tournamentDetails.title}
              </CardTitle>
              <CardDescription>{tournamentDetails.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prize Pool</p>
                  <p className="text-lg font-bold">{tournamentDetails.prize_pool?.toLocaleString()} Coins</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Game Type</p>
                  <p className="text-lg font-bold capitalize">{tournamentDetails.game_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-bold capitalize">{tournamentDetails.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <LeaderboardComponent tournamentId={tournamentId} />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Leaderboards</h1>
        <p className="text-muted-foreground">See who's winning big at WayneWagers</p>
      </div>
      
      <Tabs 
        defaultValue="all-time" 
        onValueChange={(value) => setTimeRange(value as 'all-time' | 'this-week' | 'today')}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="all-time">All Time</TabsTrigger>
          <TabsTrigger value="this-week">This Week</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-time">
          <LeaderboardComponent timeRange="all-time" />
        </TabsContent>
        <TabsContent value="this-week">
          <LeaderboardComponent timeRange="this-week" />
        </TabsContent>
        <TabsContent value="today">
          <LeaderboardComponent timeRange="today" />
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Tournament Leaderboards</h2>
        <p className="text-muted-foreground">View current rankings in active tournaments</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => navigate('/tournaments')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-casino-gold" />
              Slot Tournaments
            </CardTitle>
            <CardDescription>View all active slot machine tournaments</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => navigate('/tournaments?tab=quiz')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-casino-gold" />
              Quiz Tournaments
            </CardTitle>
            <CardDescription>View all active quiz game tournaments</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
