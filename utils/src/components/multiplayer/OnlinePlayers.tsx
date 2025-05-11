
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Dices } from 'lucide-react';
import { useMultiplayer } from '@/context/MultiplayerContext';

interface OnlinePlayersProps {
  showCount?: boolean;
  showGame?: boolean;
  gameName?: string;
  maxDisplayed?: number;
}

const OnlinePlayers: React.FC<OnlinePlayersProps> = ({ 
  showCount = true, 
  showGame = true, 
  gameName, 
  maxDisplayed = 5 
}) => {
  const { onlineUsers, currentPlayerCount, playersInGame } = useMultiplayer();
  
  const players = gameName 
    ? playersInGame(gameName) 
    : Object.values(onlineUsers);

  const displayedPlayers = players.slice(0, maxDisplayed);
  const remainingCount = players.length - maxDisplayed;
  
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };
  
  if (players.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-4 text-center text-muted-foreground">
          <Users className="h-5 w-5 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No players online</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center">
          <Users className="h-4 w-4 mr-2" />
          {showCount && (
            <span>Online Players ({currentPlayerCount})</span>
          )}
          {!showCount && (
            <span>Online Players</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="space-y-3">
          {displayedPlayers.map(player => (
            <div key={player.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.avatar_url} />
                  <AvatarFallback>{getInitials(player.username)}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">{player.username}</div>
              </div>
              
              {showGame && player.current_game && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Dices className="h-3 w-3 mr-1" />
                        <span className="text-xs">{player.current_game}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Playing {player.current_game}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ))}
          
          {remainingCount > 0 && (
            <div className="text-center text-sm text-muted-foreground pt-2">
              + {remainingCount} more player{remainingCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnlinePlayers;
