
import React from 'react';

interface CardProps {
  suit: string;
  value: string;
  hidden?: boolean;
}

const BlackjackCard: React.FC<CardProps> = ({ suit, value, hidden = false }) => {
  const getSuitSymbol = () => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };
  
  const getSuitColor = () => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-black';
  };
  
  if (hidden) {
    return (
      <div className="w-24 h-36 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg shadow-lg border-2 border-white/20 flex items-center justify-center transform transition-transform hover:scale-105">
        <div className="text-2xl font-bold text-white transform -rotate-45">
          WW
        </div>
      </div>
    );
  }

  return (
    <div className="w-24 h-36 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col p-2 relative transform transition-transform hover:scale-105">
      <div className={`text-lg font-bold ${getSuitColor()}`}>
        {value}
      </div>
      <div className={`text-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${getSuitColor()}`}>
        {getSuitSymbol()}
      </div>
      <div className={`text-lg font-bold self-end ${getSuitColor()} transform rotate-180`}>
        {value}
      </div>
    </div>
  );
};

export default BlackjackCard;
