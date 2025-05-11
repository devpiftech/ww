
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TournamentTabsProps {
  activeTab: 'all' | 'slots' | 'quiz';
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const TournamentTabs: React.FC<TournamentTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  children 
}) => {
  return (
    <Tabs
      defaultValue="all"
      value={activeTab}
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList className="mb-6">
        <TabsTrigger value="all">All Tournaments</TabsTrigger>
        <TabsTrigger value="slots">Slot Tournaments</TabsTrigger>
        <TabsTrigger value="quiz">Quiz Tournaments</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab}>
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default TournamentTabs;
