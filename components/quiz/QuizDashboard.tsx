
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Award } from 'lucide-react';
import QuizMatchmaking from '../games/QuizMatchmaking';
import QuizStatistics from '../games/QuizStatistics';

interface QuizDashboardProps {
  activeView: 'menu' | 'stats';
  onViewChange: (view: 'menu' | 'stats') => void;
  onStartSinglePlayer: () => void;
  onStartMultiPlayer: (matchId: string) => void;
}

const QuizDashboard: React.FC<QuizDashboardProps> = ({
  activeView,
  onViewChange,
  onStartSinglePlayer,
  onStartMultiPlayer
}) => {
  return (
    <Tabs 
      defaultValue={activeView} 
      value={activeView}
      onValueChange={(value) => onViewChange(value as 'menu' | 'stats')}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 mb-6">
        <TabsTrigger value="menu" className="flex items-center gap-1">
          <Play className="h-4 w-4" /> Play Quiz
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-1">
          <Award className="h-4 w-4" /> Statistics
        </TabsTrigger>
      </TabsList>
      
      {activeView === 'menu' && (
        <QuizMatchmaking
          onStartSinglePlayer={onStartSinglePlayer}
          onStartMultiPlayer={onStartMultiPlayer}
        />
      )}
      
      {activeView === 'stats' && (
        <QuizStatistics />
      )}
    </Tabs>
  );
};

export default QuizDashboard;
