
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SpaceHeaderProps {
  title: string;
}

const SpaceHeader: React.FC<SpaceHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center mb-8">
      <Button 
        variant="ghost" 
        size="icon" 
        className="mr-2" 
        onClick={() => navigate('/slots')}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-3xl font-bold">{title}</h1>
    </div>
  );
};

export default SpaceHeader;
