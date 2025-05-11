
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Award, Trophy, Users } from 'lucide-react';

interface QuizTabsProps {
  activeTab: "play" | "stats" | "lobby" | "tournaments";
  onTabChange: (value: string) => void;
}

const QuizTabs: React.FC<QuizTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <TabsList className="mb-6">
      <TabsTrigger value="play" className="flex gap-2 items-center">
        <Play className="h-4 w-4" />
        Play Quiz
      </TabsTrigger>
      <TabsTrigger value="stats" className="flex gap-2 items-center">
        <Award className="h-4 w-4" />
        Statistics
      </TabsTrigger>
      <TabsTrigger value="tournaments" className="flex gap-2 items-center">
        <Trophy className="h-4 w-4" />
        Tournaments
      </TabsTrigger>
      <TabsTrigger value="lobby" className="flex gap-2 items-center">
        <Users className="h-4 w-4" />
        Multiplayer Lobby
      </TabsTrigger>
    </TabsList>
  );
};

export default QuizTabs;
