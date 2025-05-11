
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CurrencySelector from '@/components/CurrencySelector';

const SlotMachinePage: React.FC = () => {
  const navigate = useNavigate();
  
  const slotMachines = [
    {
      id: 'classic',
      name: 'Lucky Spinner',
      description: 'Classic 3-reel slot machine with traditional symbols',
      theme: 'classic',
      reels: 3,
      difficulty: 'Easy',
    },
    {
      id: 'fruity',
      name: 'Fruit Frenzy',
      description: '5-reel slot with fresh fruit symbols and free spins',
      theme: 'fruit',
      reels: 5,
      difficulty: 'Medium',
    },
    {
      id: 'space',
      name: 'Cosmic Cash',
      description: 'Space-themed 5-reel slot with expanding wilds and bonus rounds',
      theme: 'space',
      reels: 5,
      difficulty: 'Hard',
    },
    {
      id: 'jackpot',
      name: 'Mega Jackpot',
      description: 'Progressive jackpot game with multiple bonus features',
      theme: 'gold',
      reels: 5,
      difficulty: 'Medium',
    }
  ];
  
  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2" 
            onClick={() => navigate('/games')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Slot Machines</h1>
        </div>
        
        <CurrencySelector />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {slotMachines.map(machine => (
          <Card 
            key={machine.id} 
            className="casino-card h-full cursor-pointer transform transition-all hover:scale-105"
            onClick={() => navigate(`/slots/${machine.id}`)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{machine.name}</h3>
                  <p className="text-muted-foreground mb-4">{machine.description}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  machine.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                  machine.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {machine.difficulty}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <span className="mr-1">Reels:</span>
                  <span className="font-medium text-foreground">{machine.reels}</span>
                </div>
                
                <Button 
                  size="sm" 
                  className="casino-btn"
                >
                  Play Now
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default SlotMachinePage;
