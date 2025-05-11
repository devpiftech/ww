
import React from 'react';
import { Button } from '@/components/ui/button';
import { SportCategory } from '@/types/slots';
import { 
  Trophy, DollarSign, Activity, 
  Dices, Target, Play, GanttChart
} from 'lucide-react';

interface SportsCategorySelectorProps {
  categories: SportCategory[];
  activeCategoryId: string;
  setActiveCategoryId: (categoryId: string) => void;
}

const SportsCategorySelector: React.FC<SportsCategorySelectorProps> = ({ 
  categories, 
  activeCategoryId, 
  setActiveCategoryId 
}) => {
  // Map of sport IDs to Lucide icons
  const sportIcons: Record<string, React.ReactNode> = {
    soccer: <Target className="animate-pulse-glow" />,
    basketball: <Activity className="animate-spin-slow" />,
    baseball: <Dices className="animate-pulse-glow" />,
    football: <GanttChart className="animate-pulse-glow" />,
    hockey: <Activity className="animate-pulse-glow" />,
    tennis: <Play className="animate-pulse-glow" />,
  };

  return (
    <div className="overflow-x-auto mb-6">
      <div className="flex gap-2 min-w-max">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={activeCategoryId === category.id ? "default" : "outline"}
            onClick={() => setActiveCategoryId(category.id)}
            className={`px-4 transition-all duration-300 ${activeCategoryId === category.id ? 'shadow-lg' : ''}`}
          >
            <span className="mr-2">
              {sportIcons[category.id] || <Trophy className="animate-pulse-glow" />}
            </span>
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SportsCategorySelector;
