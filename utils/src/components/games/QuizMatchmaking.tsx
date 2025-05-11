
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Play, Users, Clock, UserPlus, Trophy, 
  MessageSquare, AlertCircle, X, Check, HeartPulse 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMultiplayer } from '@/context/MultiplayerContext';
import { createQuickMatch, joinQuickMatchQueue, leaveQuickMatchQueue } from '@/services/QuizMultiplayerService';

interface QuizMatchmakingProps {
  onStartSinglePlayer: () => void;
  onStartMultiPlayer: (matchId: string) => void;
}

const QuizMatchmaking: React.FC<QuizMatchmakingProps> = ({ 
  onStartSinglePlayer, 
  onStartMultiPlayer 
}) => {
  const { user } = useAuth();
  const { onlineUsers } = useMultiplayer();
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchmakingTime, setMatchmakingTime] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Array<{id: string, username: string, avatar_url?: string}>>([]);
  
  // Setup available players list
  useEffect(() => {
    if (!user) return;
    
    const players = Object.entries(onlineUsers)
      .map(([id, data]) => ({
        id,
        username: data.username,
        avatar_url: data.avatar_url
      }))
      .filter(player => player.id !== user.id);
    
    setAvailablePlayers(players);
  }, [onlineUsers, user]);
  
  // Handle matchmaking countdown
  useEffect(() => {
    let matchmakingInterval: NodeJS.Timeout | null = null;
    
    if (isMatching) {
      matchmakingInterval = setInterval(() => {
        setMatchmakingTime(prev => prev + 1);
        
        // If we've been searching for more than 10 seconds, complete with AI players
        if (matchmakingTime >= 10) {
          handleCompleteQuickMatch();
        }
      }, 1000);
    } else {
      setMatchmakingTime(0);
    }
    
    return () => {
      if (matchmakingInterval) {
        clearInterval(matchmakingInterval);
      }
    };
  }, [isMatching, matchmakingTime]);
  
  const handleQuickMatch = () => {
    if (!user) {
      toast.error('You need to be logged in to play multiplayer');
      return;
    }
    
    setIsMatching(true);
    joinQuickMatchQueue(user.id, user.email?.split('@')[0] || 'User', null);
    
    toast.success('Finding a match', {
      description: 'Searching for other players...'
    });
  };
  
  const handleCancelMatchmaking = () => {
    if (!user) return;
    
    setIsMatching(false);
    leaveQuickMatchQueue(user.id);
    
    toast.info('Matchmaking cancelled');
  };
  
  const handleCompleteQuickMatch = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const match = await createQuickMatch(
        user.id, 
        user.email?.split('@')[0] || 'User'
      );
      
      setIsMatching(false);
      
      toast.success('Match found!', {
        description: `Playing against ${match.players.length - 1} opponents`
      });
      
      onStartMultiPlayer(match.id);
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error('Failed to create match');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChallengePlayer = (playerId: string) => {
    setSelectedOpponent(playerId);
    setShowChallenge(true);
  };
  
  const handleConfirmChallenge = () => {
    if (!user || !selectedOpponent) return;
    
    const opponent = availablePlayers.find(p => p.id === selectedOpponent);
    if (!opponent) return;
    
    setShowChallenge(false);
    setIsLoading(true);
    
    // In a real app, we would send the challenge to the other player
    // For now, we'll just simulate a quick match
    setTimeout(() => {
      setIsLoading(false);
      
      toast.success(`Challenge sent to ${opponent.username}`, {
        description: 'Waiting for them to accept...'
      });
    }, 1000);
  };
  
  // Format the time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-casino-gold" />
              Play Casino Quiz
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {isMatching ? (
              <div className="flex flex-col items-center p-6 bg-muted/30 rounded-lg">
                <HeartPulse className="h-12 w-12 text-casino-gold animate-pulse mb-4" />
                <h3 className="text-xl font-bold mb-2">Finding Opponents</h3>
                <p className="text-muted-foreground mb-4">
                  Searching for quiz opponents... <span className="font-mono">{formatTime(matchmakingTime)}</span>
                </p>
                
                <div className="flex justify-center gap-4 mt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelMatchmaking} 
                    className="min-w-[120px]"
                    disabled={isLoading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  
                  <Button 
                    variant="default" 
                    onClick={handleCompleteQuickMatch} 
                    className="min-w-[120px]"
                    disabled={isLoading}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Play Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  className="h-auto py-8 flex flex-col"
                  onClick={onStartSinglePlayer}
                  disabled={isLoading}
                >
                  <Play className="h-10 w-10 mb-2" />
                  <div className="text-lg font-bold">Solo Play</div>
                  <div className="text-sm opacity-80 mt-1">Challenge yourself</div>
                </Button>
                
                <Button
                  className="h-auto py-8 flex flex-col"
                  variant="secondary"
                  onClick={handleQuickMatch}
                  disabled={isLoading}
                >
                  <Users className="h-10 w-10 mb-2" />
                  <div className="text-lg font-bold">Quick Match</div>
                  <div className="text-sm opacity-80 mt-1">Play against others</div>
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" /> Average wait time: &lt;30 seconds
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              <span className="animate-pulse mr-1">•</span> Online Now
            </Badge>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Challenge a Player
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[250px] px-4">
              {availablePlayers.length > 0 ? (
                <div className="space-y-3 py-4">
                  {availablePlayers.map(player => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={player.avatar_url} />
                          <AvatarFallback>{getInitials(player.username)}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium">{player.username}</div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleChallengePlayer(player.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Challenge
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-10">
                  <AlertCircle className="h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground text-center">
                    No other players currently online
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="border-t pt-3 pb-3">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleQuickMatch}
              disabled={isMatching || isLoading}
            >
              <Trophy className="mr-2 h-4 w-4" />
              Find a Quick Match
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Challenge Confirmation Dialog */}
      <Dialog open={showChallenge} onOpenChange={setShowChallenge}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Challenge Player</DialogTitle>
            <DialogDescription>
              Send a quiz challenge to this player. They'll need to accept before the match begins.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOpponent && (
            <div className="flex items-center p-4 bg-muted/30 rounded-lg">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={availablePlayers.find(p => p.id === selectedOpponent)?.avatar_url} />
                <AvatarFallback>
                  {getInitials(availablePlayers.find(p => p.id === selectedOpponent)?.username || '')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="font-medium">
                  {availablePlayers.find(p => p.id === selectedOpponent)?.username}
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">
                    <span className="animate-pulse mr-1">•</span> Online
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChallenge(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleConfirmChallenge} disabled={isLoading}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuizMatchmaking;
