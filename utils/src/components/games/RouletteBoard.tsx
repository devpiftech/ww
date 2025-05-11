
import React from 'react';
import { Button } from '@/components/ui/button';
import { BET_TYPES } from './RouletteCommon';

interface RouletteBoardProps {
  isAmerican: boolean;
  onNumberClick: (number: number) => void;
  onSplitBet?: (numbers: number[]) => void;
  onCornerBet?: (numbers: number[]) => void;
  onLineBet?: (numbers: number[]) => void;
}

const RouletteBoard: React.FC<RouletteBoardProps> = ({ 
  isAmerican, 
  onNumberClick, 
  onSplitBet,
  onCornerBet,
  onLineBet
}) => {
  // Helper to get color class for a number
  const getNumberColor = (num: number): string => {
    if (num === 0 || num === 37) return 'bg-green-700 hover:bg-green-600';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) 
      ? 'bg-red-700 hover:bg-red-600' 
      : 'bg-black hover:bg-slate-800';
  };

  // Generate numbers for standard roulette layout (correct layout for betting)
  const generateRouletteLayout = () => {
    // Create a 3 x 12 grid layout where columns represent betting columns
    const rows = [[], [], []];
    
    // Fill columns with numbers in standard roulette layout
    // Row 1 contains numbers 3,6,9,12,15,18,21,24,27,30,33,36
    // Row 2 contains numbers 2,5,8,11,14,17,20,23,26,29,32,35
    // Row 3 contains numbers 1,4,7,10,13,16,19,22,25,28,31,34
    for (let col = 0; col < 12; col++) {
      for (let row = 0; row < 3; row++) {
        const num = 3 * col + 3 - row;
        rows[row].push(num);
      }
    }
    
    return rows;
  };

  const rows = generateRouletteLayout();

  // Handle split bet (between two adjacent numbers)
  const handleSplitBet = (numbers: number[]) => {
    if (onSplitBet) {
      onSplitBet(numbers);
    } else {
      // Fallback if onSplitBet is not provided
      console.log(`Split bet on ${numbers.join(',')}`);
    }
  };

  // Handle corner bet (between four adjacent numbers)
  const handleCornerBet = (numbers: number[]) => {
    if (onCornerBet) {
      onCornerBet(numbers);
    } else {
      // Fallback if onCornerBet is not provided
      console.log(`Corner bet on ${numbers.join(',')}`);
    }
  };

  // Handle line bet (on 6 numbers - two rows)
  const handleLineBet = (numbers: number[]) => {
    if (onLineBet) {
      onLineBet(numbers);
    } else {
      // Fallback if onLineBet is not provided
      console.log(`Line bet on ${numbers.join(',')}`);
    }
  };

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Zero and double zero (if American) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-1">
          {isAmerican && (
            <div 
              className="bg-green-700 text-white h-16 flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-green-600 transition-colors"
              onClick={() => onNumberClick(37)}
            >
              00
            </div>
          )}
          <div 
            className={`bg-green-700 text-white h-16 flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-green-600 transition-colors ${isAmerican ? '' : 'col-span-2'}`}
            onClick={() => onNumberClick(0)}
          >
            0
          </div>
        </div>

        {/* Numbers 1-36 in correct roulette layout */}
        <div className="grid grid-rows-3 gap-1">
          {rows.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid grid-cols-12 gap-1">
              {row.map((num) => (
                <div
                  key={num}
                  className={`${getNumberColor(num)} text-white h-10 flex items-center justify-center cursor-pointer transition-opacity font-medium`}
                  onClick={() => onNumberClick(num)}
                >
                  {num}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Column bets */}
        <div className="grid grid-cols-3 gap-1 mt-1">
          <Button 
            variant="outline"
            className="border-slate-400 h-10"
            onClick={() => onNumberClick(-10)} // Column 1: 1,4,7,10,13,16,19,22,25,28,31,34
          >
            1st Column
          </Button>
          <Button 
            variant="outline"
            className="border-slate-400 h-10"
            onClick={() => onNumberClick(-11)} // Column 2: 2,5,8,11,14,17,20,23,26,29,32,35
          >
            2nd Column
          </Button>
          <Button 
            variant="outline"
            className="border-slate-400 h-10"
            onClick={() => onNumberClick(-12)} // Column 3: 3,6,9,12,15,18,21,24,27,30,33,36
          >
            3rd Column
          </Button>
        </div>

        {/* Bottom betting options */}
        <div className="grid grid-cols-3 gap-1 mt-1">
          <Button 
            variant="outline"
            className="border-slate-400 h-10"
            onClick={() => onNumberClick(-1)}
          >
            1st 12 (1-12)
          </Button>
          <Button 
            variant="outline"
            className="border-slate-400 h-10"
            onClick={() => onNumberClick(-2)}
          >
            2nd 12 (13-24)
          </Button>
          <Button 
            variant="outline"
            className="border-slate-400 h-10"
            onClick={() => onNumberClick(-3)}
          >
            3rd 12 (25-36)
          </Button>
        </div>

        {/* Outside bets */}
        <div className="grid grid-cols-6 gap-1 mt-1">
          <Button 
            variant="outline"
            className="border-slate-400 h-10"
            onClick={() => onNumberClick(-4)}
          >
            1-18
          </Button>
          <Button 
            variant="outline"
            className="border-slate-400 h-10 text-red-600"
            onClick={() => onNumberClick(-5)}
          >
            Red
          </Button>
          <Button 
            variant="outline"
            className="border-slate-400 h-10"
            onClick={() => onNumberClick(-6)}
          >
            Even
          </Button>
          <Button 
            variant="outline"
            className="border-slate-400 h-10"
            onClick={() => onNumberClick(-7)}
          >
            Odd
          </Button>
          <Button 
            variant="outline" 
            className="border-slate-400 h-10"
            onClick={() => onNumberClick(-8)}
          >
            Black
          </Button>
          <Button 
            variant="outline"
            className="border-slate-400 h-10"
            onClick={() => onNumberClick(-9)}
          >
            19-36
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RouletteBoard;
