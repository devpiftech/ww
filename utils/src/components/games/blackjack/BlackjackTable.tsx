
import React from 'react';
import BlackjackCard from '../BlackjackCard';
import { PlayingCard } from './types';

interface BlackjackTableProps {
  dealerHand: PlayingCard[];
  playerHand: PlayingCard[];
  playerSplitHand: PlayingCard[];
  dealerCardHidden: boolean;
  activeSplitHand: boolean;
  hasPlayerSplit: boolean;
  calculateHandValue: (hand: PlayingCard[]) => number;
}

const BlackjackTable: React.FC<BlackjackTableProps> = ({
  dealerHand,
  playerHand,
  playerSplitHand,
  dealerCardHidden,
  activeSplitHand,
  hasPlayerSplit,
  calculateHandValue
}) => {
  return (
    <>
      <div className="space-y-2">
        <p className="text-white opacity-80">Dealer's Hand:</p>
        <div className="flex gap-2 flex-wrap">
          {dealerHand.map((card, index) => (
            <BlackjackCard
              key={`dealer-${index}`}
              suit={card.suit}
              value={card.value}
              hidden={index === 1 && dealerCardHidden}
            />
          ))}
        </div>
        {!dealerCardHidden && (
          <p className="text-yellow-200 font-semibold">
            Dealer: {calculateHandValue(dealerHand)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-white opacity-80">{activeSplitHand ? "Split Hand:" : "Your Hand:"}</p>
        <div className="flex gap-2 flex-wrap">
          {(activeSplitHand ? playerSplitHand : playerHand).map((card, index) => (
            <BlackjackCard
              key={`player-${index}`}
              suit={card.suit}
              value={card.value}
            />
          ))}
        </div>
        <p className="text-yellow-200 font-semibold">
          {activeSplitHand ? "Split Hand:" : "Your Hand:"} {calculateHandValue(activeSplitHand ? playerSplitHand : playerHand)}
        </p>
      </div>
      
      {hasPlayerSplit && !activeSplitHand && playerSplitHand.length > 0 && (
        <div className="space-y-2">
          <p className="text-white opacity-80">Split Hand:</p>
          <div className="flex gap-2 flex-wrap">
            {playerSplitHand.map((card, index) => (
              <BlackjackCard
                key={`split-${index}`}
                suit={card.suit}
                value={card.value}
              />
            ))}
          </div>
          <p className="text-yellow-200 font-semibold">
            Split Hand: {calculateHandValue(playerSplitHand)}
          </p>
        </div>
      )}
    </>
  );
};

export default BlackjackTable;
