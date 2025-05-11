
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import GameCard from '@/components/GameCard';
import { useMultiplayer } from '@/context/MultiplayerContext';
import OnlinePlayers from '@/components/multiplayer/OnlinePlayers';
import CurrencySelector from '@/components/CurrencySelector';
import {
  Dices,
  Coins,
  ArrowUpDown,
  Hash,
  Smartphone,
  Award,
  Trophy,
  Flag
} from 'lucide-react';

const Games = () => {
  const navigate = useNavigate();
  const { playersInGame } = useMultiplayer();
  
  const games = [
    {
      id: 'slots',
      title: 'Slot Machines',
      description: 'Try your luck with our exciting slot machines',
      icon: <Coins className="h-6 w-6" />,
      color: 'from-yellow-500 to-yellow-700',
      path: '/slots',
    },
    {
      id: 'sportsbook',
      title: 'Sportsbook',
      description: 'Bet on live sports events and matches',
      icon: <Trophy className="h-6 w-6" />,
      color: 'from-green-500 to-green-700',
      path: '/sportsbook',
      isNew: true,
    },
    {
      id: 'blackjack',
      title: 'Blackjack',
      description: 'Classic card game against the dealer',
      icon: <Dices className="h-6 w-6" />,
      color: 'from-red-500 to-red-700',
      path: '/blackjack',
    },
    {
      id: 'cointoss',
      title: 'Coin Toss',
      description: 'Heads or tails? Simple 50/50 game',
      icon: <Coins className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-700',
      path: '/cointoss',
    },
    {
      id: 'highlow',
      title: 'High Low',
      description: 'Guess if the next card is higher or lower',
      icon: <ArrowUpDown className="h-6 w-6" />,
      color: 'from-purple-500 to-purple-700',
      path: '/highlow',
    },
    {
      id: 'picknumber',
      title: 'Lucky Number',
      description: 'Pick numbers and win if they match',
      icon: <Hash className="h-6 w-6" />,
      color: 'from-emerald-500 to-emerald-700',
      path: '/picknumber',
    },
    {
      id: 'roulette-eu',
      title: 'European Roulette',
      description: 'Classic European roulette with 37 numbers',
      icon: <Dices className="h-6 w-6" />,
      color: 'from-green-600 to-green-800',
      path: '/roulette-eu',
    },
    {
      id: 'roulette-us',
      title: 'American Roulette',
      description: 'American roulette with 38 numbers including 00',
      icon: <Dices className="h-6 w-6" />,
      color: 'from-red-600 to-red-800',
      path: '/roulette-us',
    },
    {
      id: 'poker',
      title: 'Video Poker',
      description: 'Classic video poker - Jacks or Better',
      icon: <Award className="h-6 w-6" />,
      color: 'from-blue-600 to-blue-800',
      path: '/poker',
    },
    {
      id: 'dice',
      title: 'Casino Dice',
      description: 'Roll the dice and bet on the outcome',
      icon: <Dices className="h-6 w-6" />,
      color: 'from-orange-500 to-orange-700',
      path: '/dice',
    },
    {
      id: 'racing',
      title: 'Virtual Racing',
      description: 'Bet on virtual horse and car races',
      icon: <Flag className="h-6 w-6" />,
      color: 'from-amber-500 to-amber-700',
      path: '/racing',
    },
    {
      id: 'quiz',
      title: 'Casino Quiz',
      description: 'Test your knowledge and win prizes',
      icon: <Smartphone className="h-6 w-6" />,
      color: 'from-indigo-500 to-indigo-700',
      path: '/quiz',
    },
  ];
  
  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Casino Games</h1>
        <CurrencySelector />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const playerCount = playersInGame(game.title).length;
              
              return (
                <GameCard
                  key={game.id}
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                  color={game.color}
                  onClick={() => navigate(game.path)}
                  isNew={game.isNew}
                  path={game.path}
                  playerCount={playerCount}
                />
              );
            })}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <OnlinePlayers 
            showCount={true}
            showGame={true}
            maxDisplayed={10}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Games;
