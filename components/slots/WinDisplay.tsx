
import React from 'react';

interface WinDisplayProps {
  lastWin: number;
}

const WinDisplay: React.FC<WinDisplayProps> = ({ lastWin }) => {
  if (lastWin <= 0) return null;
  
  // Different messages based on win size
  const getWinMessage = () => {
    if (lastWin > 1000) return "COSMIC JACKPOT!";
    if (lastWin > 500) return "STELLAR WIN!";
    if (lastWin > 200) return "GALACTIC BONUS!";
    return "Last Win:";
  };
  
  const message = getWinMessage();
  const winClass = lastWin > 500 ? "text-2xl animate-pulse-glow" : "text-xl";
  
  return (
    <div className="mt-4 text-center">
      <div className={`text-casino-gold font-bold ${winClass}`}>
        {message} <span>{lastWin} coins</span>
      </div>
    </div>
  );
};

export default WinDisplay;
