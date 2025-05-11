
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import GameCard from '@/components/GameCard';
import { Dices, Coins, CreditCard } from 'lucide-react';

const FeaturedGames: React.FC = () => {
  const navigate = useNavigate();
  
  const games = [
    {
      id: "slots",
      title: "Lucky Spinner",
      description: "Try your luck with our exciting slot machine!",
      icon: <CreditCard className="h-5 w-5" />,
      color: "from-yellow-500 to-yellow-700",
      path: "/slots",
    },
    {
      id: "poker",
      title: "Video Poker",
      description: "Classic video poker with great payouts!",
      icon: <Dices className="h-5 w-5" />,
      color: "from-blue-600 to-blue-800",
      path: "/poker",
    },
    {
      id: "blackjack",
      title: "Blackjack",
      description: "Beat the dealer to 21 without going bust!",
      icon: <Dices className="h-5 w-5" />,
      color: "from-red-500 to-red-700",
      path: "/blackjack",
    },
  ];
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Games</h2>
        <Link to="/games">
          <Button variant="link" className="text-casino-gold">View All</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => (
          <GameCard 
            key={game.id}
            title={game.title}
            description={game.description}
            icon={game.icon}
            color={game.color}
            path={game.path}
            onClick={() => navigate(game.path)}
            isNew={false}
            playerCount={0}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedGames;
