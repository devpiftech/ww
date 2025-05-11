
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  onClick: () => void;
  isNew?: boolean;
  playerCount?: number;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
  isNew,
  playerCount = 0
}) => {
  return (
    <Card
      className="casino-card h-full cursor-pointer transform transition-all hover:scale-105"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white mr-3`}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}
                {isNew && (
                  <Badge variant="default" className="ml-2 bg-green-600">New</Badge>
                )}
              </h3>
            </div>
          </div>
          
          {playerCount > 0 && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              <Users className="h-3 w-3 mr-1" />
              {playerCount}
            </Badge>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        
        <div className="flex items-center justify-end mt-2">
          <Button className="casino-btn" size="sm">
            Play Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GameCard;
