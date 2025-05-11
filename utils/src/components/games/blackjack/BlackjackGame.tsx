
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import BlackjackTable from './BlackjackTable';
import BettingControls from './BettingControls';
import GameControls from './GameControls';
import { useBlackjackGame } from './hooks/useBlackjackGame';

interface BlackjackGameProps {
  user: User | null;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

const BlackjackGame: React.FC<BlackjackGameProps> = ({ user, coins, setCoins }) => {
  const {
    gameState,
    playerHand,
    playerSplitHand,
    dealerHand,
    dealerCardHidden,
    message,
    activeSplitHand,
    betAmount,
    isLoading,
    hasPlayerSplit,
    calculateHandValue,
    handleBetChange,
    startGame,
    handleHit,
    handleStand,
    handleDoubleDown,
    handleSplit,
    canSplit,
    canDoubleDown,
    resetGame,
  } = useBlackjackGame({ user, coins, setCoins });

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-green-800 border-casino-gold/30 p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Blackjack</h2>
          <p className="text-gray-200">{message}</p>
          
          {gameState === 'betting' && (
            <BettingControls 
              betAmount={betAmount}
              maxBet={coins}
              isLoading={isLoading}
              onBetChange={handleBetChange}
              onStartGame={startGame}
            />
          )}
        </div>

        {gameState !== 'betting' && (
          <div className="space-y-8">
            <BlackjackTable
              dealerHand={dealerHand}
              playerHand={playerHand}
              playerSplitHand={playerSplitHand}
              dealerCardHidden={dealerCardHidden}
              activeSplitHand={activeSplitHand}
              hasPlayerSplit={hasPlayerSplit}
              calculateHandValue={calculateHandValue}
            />

            <GameControls
              gameState={gameState}
              canDoubleDown={canDoubleDown()}
              canSplit={canSplit()}
              playerHand={playerHand}
              playerSplitHand={playerSplitHand}
              activeSplitHand={activeSplitHand}
              calculateHandValue={calculateHandValue}
              onHit={handleHit}
              onStand={handleStand}
              onDoubleDown={handleDoubleDown}
              onSplit={handleSplit}
              onPlayAgain={resetGame}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default BlackjackGame;
