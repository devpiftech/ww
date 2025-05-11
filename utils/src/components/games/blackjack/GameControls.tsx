
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlayingCard } from './types';

interface GameControlsProps {
  gameState: 'betting' | 'playing' | 'splitting' | 'dealerTurn' | 'gameOver';
  canDoubleDown: boolean;
  canSplit: boolean;
  playerHand: PlayingCard[];
  playerSplitHand: PlayingCard[];
  activeSplitHand: boolean;
  calculateHandValue: (hand: PlayingCard[]) => number;
  onHit: (isSplitHand?: boolean) => void;
  onStand: (isSplitHand?: boolean) => void;
  onDoubleDown: () => void;
  onSplit: () => void;
  onPlayAgain: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  canDoubleDown,
  canSplit,
  playerHand,
  playerSplitHand,
  activeSplitHand,
  calculateHandValue,
  onHit,
  onStand,
  onDoubleDown,
  onSplit,
  onPlayAgain
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {(gameState === 'playing' || gameState === 'splitting') && (
        <>
          <Button
            onClick={() => onHit(activeSplitHand)}
            className="bg-red-600 hover:bg-red-700 text-white flex-1"
            disabled={
              (activeSplitHand && calculateHandValue(playerSplitHand) >= 21) || 
              (!activeSplitHand && calculateHandValue(playerHand) >= 21) ||
              gameState !== 'playing' && gameState !== 'splitting'
            }
          >
            Hit
          </Button>
          <Button
            onClick={() => onStand(activeSplitHand)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            disabled={
              gameState !== 'playing' && gameState !== 'splitting'
            }
          >
            Stand
          </Button>
          {canDoubleDown && (
            <Button
              onClick={onDoubleDown}
              className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
              disabled={!canDoubleDown}
            >
              Double Down
            </Button>
          )}
          {canSplit && (
            <Button
              onClick={onSplit}
              className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
              disabled={!canSplit}
            >
              Split
            </Button>
          )}
        </>
      )}
      
      {gameState === 'gameOver' && (
        <Button
          onClick={onPlayAgain}
          className="bg-casino-gold text-black hover:bg-yellow-400 w-full py-6"
        >
          Play Again
        </Button>
      )}
    </div>
  );
};

export default GameControls;
