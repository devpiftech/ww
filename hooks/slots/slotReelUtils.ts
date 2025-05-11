
import { SlotSymbol } from '@/types/slots';

// Create reel data for animation
export const generateReelData = (symbols: SlotSymbol[], reels: number): SlotSymbol[][] => {
  const newReelData = Array(reels).fill(0).map(() => 
    [...symbols].sort(() => Math.random() - 0.5)
  );
  
  return newReelData;
};
