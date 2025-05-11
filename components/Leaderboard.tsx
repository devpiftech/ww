
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LeaderboardEntry, LeaderboardResponse } from '@/services/types/supabaseTypes';

interface LeaderboardProps {
  timeRange?: 'all-time' | 'this-week' | 'today';
  tournamentId?: string;
}

const LeaderboardComponent: React.FC<LeaderboardProps> = ({ timeRange = 'all-time', tournamentId }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [userRank, setUserRank] = useState<{ rank: number; games_played: number; total_winnings: number } | null>(null);
  const [userTournamentStanding, setUserTournamentStanding] = useState<{ rank: number; score: number } | null>(null);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        if (tournamentId) {
          // Fetch tournament leaderboard using the new RPC function
          const { data, error } = await supabase
            .rpc('get_tournament_leaderboard', {
              tournament_id: tournamentId
            });
          
          if (error) {
            console.error('Error fetching tournament leaderboard:', error);
            setLoading(false);
            return;
          }
          
          if (data && Array.isArray(data)) {
            const formattedData = data.map((item: any, index: number) => ({
              id: item.id,
              user_id: item.user_id, 
              rank: item.rank,
              username: item.username || 'Player',
              avatar_url: item.avatar_url || undefined,
              score: item.score,
              winnings: 0, // Tournaments don't track winnings directly
              isPlayer: user?.id === item.user_id
            }));
            setLeaderboardData(formattedData);
          }
        } else {
          // Fetch regular leaderboard using the get_leaderboard function
          const { data, error } = await supabase
            .rpc('get_leaderboard');
          
          if (error) {
            console.error('Error fetching leaderboard:', error);
            setLoading(false);
            return;
          }
          
          if (data && Array.isArray(data)) {
            const formattedData = data.map((item: LeaderboardResponse, index: number) => ({
              id: item.id,
              user_id: item.id, // Using id field as user_id
              rank: index + 1,
              username: item.username || 'Player',
              avatar_url: item.avatar_url || undefined,
              score: item.games_won, 
              winnings: item.total_winnings,
              isPlayer: user?.id === item.id
            }));
            setLeaderboardData(formattedData);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [timeRange, tournamentId, user]);
  
  useEffect(() => {
    const fetchUserRank = async () => {
      if (!user?.id) return;
      
      if (tournamentId) {
        try {
          const { data, error } = await supabase
            .rpc('get_user_tournament_standing', {
              tournament_id: tournamentId,
              user_id: user.id
            });
          
          if (error) {
            console.error('Error getting tournament standing:', error);
            return null;
          }
          
          if (data && Array.isArray(data) && data.length > 0) {
            const standingData = data[0];
            setUserTournamentStanding(standingData ? {
              rank: standingData.rank,
              score: standingData.score
            } : null);
          } else if (data && typeof data === 'object') {
            // Handle non-array response
            setUserTournamentStanding({
              rank: data.rank,
              score: data.score
            });
          }
        } catch (error) {
          console.error('Error in getUserTournamentStanding:', error);
        }
      } else {
        // For regular leaderboard, use the get_user_rank function
        try {
          const { data, error } = await supabase
            .rpc('get_user_rank', {
              target_user_id: user.id,
              time_period: timeRange
            });
            
          if (error) {
            console.error('Error getting user rank:', error);
            return;
          }
          
          if (data && Array.isArray(data) && data.length > 0) {
            const rankData = data[0];
            setUserRank({
              rank: Number(rankData.rank),
              games_played: Number(rankData.games_played),
              total_winnings: Number(rankData.total_winnings)
            });
          } else if (data && typeof data === 'object') {
            // Handle non-array response
            setUserRank({
              rank: Number(data.rank),
              games_played: Number(data.games_played),
              total_winnings: Number(data.total_winnings)
            });
          }
        } catch (error) {
          console.error('Error getting user rank:', error);
        }
      }
    };
    
    fetchUserRank();
  }, [user, timeRange, tournamentId, leaderboardData]);
  
  return (
    <div className="relative">
      <ScrollArea className="w-full">
        <div className="w-full">
          <div className="grid grid-cols-[50px_1fr_100px_75px] gap-4 py-2 px-4 text-sm font-medium text-muted-foreground">
            <div>Rank</div>
            <div>Player</div>
            <div className="text-right">Score</div>
            <div className="text-right">Winnings</div>
          </div>
          
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[50px_1fr_100px_75px] gap-4 py-2 px-4">
                  <div className="font-bold"><Skeleton className="h-5 w-5" /></div>
                  <div className="flex items-center font-medium">
                    <Avatar className="mr-2 h-8 w-8">
                      <AvatarFallback><Skeleton className="h-8 w-8" /></AvatarFallback>
                    </Avatar>
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                  <div className="text-right"><Skeleton className="h-4 w-[75px]" /></div>
                  <div className="text-right"><Skeleton className="h-4 w-[50px]" /></div>
                </div>
              ))}
            </>
          ) : (
            <>
              {leaderboardData.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-[50px_1fr_100px_75px] gap-4 py-2 px-4"
                >
                  <div className="font-bold">
                    {entry.rank}
                    {entry.rank === 1 && <Badge className="ml-2">👑</Badge>}
                  </div>
                  <div className="flex items-center font-medium">
                    <Avatar className="mr-2 h-8 w-8">
                      <AvatarImage src={entry.avatar_url} />
                      <AvatarFallback>{entry.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {entry.username}
                    {entry.isPlayer && <Badge className="ml-2">You</Badge>}
                  </div>
                  <div className="text-right">{entry.score}</div>
                  <div className="text-right">{entry.winnings?.toLocaleString()}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
      
      {user && !tournamentId && userRank && (
        <div className="absolute bottom-0 left-0 w-full bg-background/80 backdrop-blur-sm py-4 px-6 border-t">
          <p className="text-sm text-muted-foreground">
            Your Rank: #{userRank.rank} | Games Played: {userRank.games_played} | Total Winnings: {userRank.total_winnings}
          </p>
        </div>
      )}
      
      {user && tournamentId && userTournamentStanding && (
        <div className="absolute bottom-0 left-0 w-full bg-background/80 backdrop-blur-sm py-4 px-6 border-t">
          <p className="text-sm text-muted-foreground">
            Your Rank: #{userTournamentStanding.rank} | Score: {userTournamentStanding.score}
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardComponent;
