
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TournamentWinner } from '@/services/TournamentService';
import { Separator } from '@/components/ui/separator';
import { Trophy, Clock, Users, Award, Star, Medal } from 'lucide-react';

interface TournamentCardProps {
  id: string;
  title: string;
  description: string;
  prizePool: number;
  participants: number;
  timeLeft: string;
  game: 'slots' | 'quiz';
  type: 'daily' | 'weekly' | 'monthly';
  style: 'standard' | 'premium' | 'seasonal' | 'championship';
  isActive: boolean;
  winners?: TournamentWinner[];
  isJoined?: boolean; // Add the missing prop
  onJoin: () => void;
  onViewLeaderboard: () => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  id,
  title,
  description,
  prizePool,
  participants,
  timeLeft,
  game,
  type,
  style,
  isActive,
  winners,
  isJoined = false, // Default to false
  onJoin,
  onViewLeaderboard
}) => {
  const [showWinners, setShowWinners] = useState(false);
  
  // Style-based card classes
  const getStyleClasses = () => {
    switch (style) {
      case 'premium':
        return "border-amber-500/30 bg-gradient-to-b from-card to-amber-950/20";
      case 'seasonal':
        return "border-emerald-500/30 bg-gradient-to-b from-card to-emerald-950/20";
      case 'championship':
        return "border-purple-500/30 bg-gradient-to-b from-card to-purple-950/20";
      default:
        return "border-border/30";
    }
  };
  
  // Style-based icon
  const StyleIcon = () => {
    switch (style) {
      case 'premium':
        return <Star className="h-5 w-5 text-amber-500" />;
      case 'seasonal':
        return <Award className="h-5 w-5 text-emerald-500" />;
      case 'championship':
        return <Medal className="h-5 w-5 text-purple-500" />;
      default:
        return <Trophy className="h-5 w-5 text-casino-gold" />;
    }
  };
  
  // Badge color based on tournament type
  const getBadgeColor = () => {
    switch (type) {
      case 'daily':
        return 'bg-blue-500';
      case 'weekly':
        return 'bg-purple-500';
      case 'monthly':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Badge color based on game type
  const getGameBadgeColor = () => {
    switch (game) {
      case 'slots':
        return 'bg-emerald-500';
      case 'quiz':
        return 'bg-cyan-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Style badge
  const getStyleBadge = () => {
    switch (style) {
      case 'premium':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/50">
            Premium
          </Badge>
        );
      case 'seasonal':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/50">
            Seasonal
          </Badge>
        );
      case 'championship':
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/50">
            Championship
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/50">
            Standard
          </Badge>
        );
    }
  };
  
  return (
    <Card className={`w-full hover:shadow-lg transition-shadow ${getStyleClasses()}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StyleIcon />
              <CardTitle className="text-xl">{title}</CardTitle>
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Badge variant="secondary" className={getGameBadgeColor()}>
                {game === 'slots' ? 'Slots' : 'Quiz'}
              </Badge>
              <Badge variant="outline" className={getBadgeColor()}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            </div>
            <div className="flex justify-end">
              {getStyleBadge()}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {showWinners && winners && winners.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              Winners
            </h3>
            
            {winners.map((winner) => (
              <div key={winner.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center font-bold text-xs bg-muted rounded-full">
                    {winner.rank}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={winner.avatarUrl} />
                    <AvatarFallback>{winner.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{winner.username}</span>
                </div>
                <div className="text-sm font-medium">
                  {winner.prize.toLocaleString()} coins
                </div>
              </div>
            ))}
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowWinners(false)}
            >
              Show Tournament Details
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Prize Pool
                </span>
                <span className="font-bold">{prizePool.toLocaleString()} Coins</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Participants
                </span>
                <span className="font-bold">{participants}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Time Remaining
              </span>
              <span className="font-bold">{timeLeft}</span>
            </div>
            
            {winners && winners.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowWinners(true)}
              >
                Show Winners
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-4 flex justify-between gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onViewLeaderboard}
        >
          Leaderboard
        </Button>
        <Button 
          variant={isActive ? "default" : "secondary"} 
          className={`flex-1 ${style === 'championship' ? 'bg-purple-600 hover:bg-purple-700' : 
                              style === 'premium' ? 'bg-amber-600 hover:bg-amber-700' : 
                              style === 'seasonal' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
          disabled={!isActive || isJoined}
          onClick={onJoin}
        >
          {!isActive ? 'Ended' : isJoined ? 'Joined' : 'Join Tournament'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;
