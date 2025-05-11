
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Clock, Trophy } from 'lucide-react';
import { useMultiplayer } from '@/context/MultiplayerContext';

interface GameLobbyProps {
  gameName: string;
  onStartGame?: () => void;
  showChat?: boolean;
}

const GameLobby: React.FC<GameLobbyProps> = ({ 
  gameName,
  onStartGame,
  showChat = true 
}) => {
  const { playersInGame } = useMultiplayer();
  const players = playersInGame(gameName);
  
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <Users className="h-5 w-5 mr-2" />
          {gameName} Lobby
          <Badge className="ml-2 bg-green-600" variant="secondary">
            {players.length} Online
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Players in Lobby
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-3">
                  {players.length > 0 ? (
                    players.map(player => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={player.avatar_url} />
                            <AvatarFallback>{getInitials(player.username)}</AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-medium">{player.username}</div>
                        </div>
                        
                        {player.last_activity && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(player.last_activity).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-10">
                      Waiting for other players...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {showChat && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Game Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="py-0">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm mb-4">Chat with other players</p>
                  
                  <Button size="sm" className="w-full" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Open Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {onStartGame && players.length > 0 && (
          <div className="p-4 border-t">
            <Button 
              onClick={onStartGame}
              className="w-full" 
              size="lg"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Start Game with {players.length} Player{players.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameLobby;
