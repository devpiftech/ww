
import React from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TournamentHeaderProps {
  title: string;
  subtitle: string;
}

const TournamentHeader: React.FC<TournamentHeaderProps> = ({ title, subtitle }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate('/quiz')}
          className="flex items-center gap-2"
        >
          <Trophy className="h-4 w-4" />
          Play Quiz
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => navigate('/slots')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Play Slots
        </Button>
      </div>
    </div>
  );
};

export default TournamentHeader;
