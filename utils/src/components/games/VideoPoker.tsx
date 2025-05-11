
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, ChevronsUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface VideoPokerProps {
  user: User | null;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

// Define card suit and value types
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface PokerCard {
  suit: Suit;
  value: Value;
  held: boolean;
}

// Define hand ranking types
type HandRanking = 
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'Jacks or Better'
  | 'High Card';

// Define payouts for each hand ranking
const PAYOUTS: Record<HandRanking, number[]> = {
  'Royal Flush': [250, 500, 750, 1000, 4000],
  'Straight Flush': [50, 100, 150, 200, 250],
  'Four of a Kind': [25, 50, 75, 100, 125],
  'Full House': [9, 18, 27, 36, 45],
  'Flush': [6, 12, 18, 24, 30],
  'Straight': [4, 8, 12, 16, 20],
  'Three of a Kind': [3, 6, 9, 12, 15],
  'Two Pair': [2, 4, 6, 8, 10],
  'Jacks or Better': [1, 2, 3, 4, 5],
  'High Card': [0, 0, 0, 0, 0]
};

const VideoPoker: React.FC<VideoPokerProps> = ({ user, coins, setCoins }) => {
  const [deck, setDeck] = useState<PokerCard[]>([]);
  const [hand, setHand] = useState<PokerCard[]>([]);
  const [isDealt, setIsDealt] = useState(false);
  const [isDrawn, setIsDrawn] = useState(false);
  const [betAmount, setBetAmount] = useState(5);
  const [handRank, setHandRank] = useState<HandRanking | null>(null);
  const [winnings, setWinnings] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize deck
  useEffect(() => {
    initializeDeck();
  }, []);
  
  const initializeDeck = () => {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values: Value[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let newDeck: PokerCard[] = [];
    
    for (const suit of suits) {
      for (const value of values) {
        newDeck.push({ suit, value, held: false });
      }
    }
    
    // Shuffle deck
    newDeck = shuffleDeck(newDeck);
    setDeck(newDeck);
  };
  
  const shuffleDeck = (deckToShuffle: PokerCard[]): PokerCard[] => {
    const shuffled = [...deckToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const dealHand = async () => {
    if (betAmount > coins) {
      toast.error('Not enough coins for this bet');
      return;
    }
    
    setIsLoading(true);
    
    // Deduct bet amount
    if (user) {
      try {
        const { data, error } = await supabase.rpc('update_balance', {
          user_uuid: user.id,
          amount: -betAmount,
          t_type: 'bet',
          game_name: 'video-poker',
          meta: { bet_amount: betAmount }
        });
        
        if (error) throw error;
        
        setCoins(prevCoins => prevCoins - betAmount);
      } catch (error) {
        console.error('Error placing bet:', error);
        toast.error('Error placing bet');
        setIsLoading(false);
        return;
      }
    } else {
      setCoins(prevCoins => prevCoins - betAmount);
    }
    
    // Reset states
    setIsDealt(true);
    setIsDrawn(false);
    setHandRank(null);
    setWinnings(0);
    
    // Deal 5 cards
    const newDeck = [...deck];
    const newHand = newDeck.splice(0, 5).map(card => ({ ...card, held: false }));
    setHand(newHand);
    setDeck(newDeck);
    
    setIsLoading(false);
  };
  
  const drawCards = async () => {
    setIsLoading(true);
    
    // Replace non-held cards
    const newDeck = [...deck];
    const newHand = [...hand];
    
    for (let i = 0; i < hand.length; i++) {
      if (!hand[i].held && newDeck.length > 0) {
        newHand[i] = { ...newDeck.shift()!, held: false };
      }
    }
    
    setHand(newHand);
    setDeck(newDeck);
    setIsDealt(false);
    setIsDrawn(true);
    
    // Evaluate hand
    const result = evaluateHand(newHand);
    setHandRank(result);
    
    // Calculate winnings
    const betIndex = Math.min(betAmount / 5 - 1, 4);
    const payout = result ? PAYOUTS[result][betIndex] : 0;
    const totalWinnings = betAmount * payout;
    setWinnings(totalWinnings);
    
    // Update balance if won
    if (totalWinnings > 0 && user) {
      try {
        const { data, error } = await supabase.rpc('update_balance', {
          user_uuid: user.id,
          amount: totalWinnings,
          t_type: 'win',
          game_name: 'video-poker',
          meta: {
            bet_amount: betAmount,
            hand_rank: result,
            payout: payout,
            cards: newHand.map(card => `${card.value}${card.suit.charAt(0)}`)
          }
        });
        
        if (error) throw error;
        
        // Also record game result
        const { error: resultError } = await supabase.from('game_results').insert({
          user_id: user.id,
          game: 'video-poker',
          bet_amount: betAmount,
          win_amount: totalWinnings,
          is_win: totalWinnings > 0,
          game_data: {
            hand_rank: result,
            payout: payout,
            cards: newHand.map(card => `${card.value}${card.suit.charAt(0)}`)
          }
        });
        
        if (resultError) throw resultError;
        
        setCoins(prevCoins => prevCoins + totalWinnings);
        
        if (totalWinnings > 0) {
          toast.success(`You won ${totalWinnings} coins with ${result}!`);
        }
      } catch (error) {
        console.error('Error updating balance:', error);
        toast.error('Error updating balance');
      }
    } else if (totalWinnings > 0) {
      setCoins(prevCoins => prevCoins + totalWinnings);
      toast.success(`You won ${totalWinnings} coins with ${result}!`);
    } else {
      toast.error('Better luck next time!');
    }
    
    setIsLoading(false);
  };
  
  const toggleHold = (index: number) => {
    if (!isDealt || isDrawn) return;
    
    const newHand = [...hand];
    newHand[index].held = !newHand[index].held;
    setHand(newHand);
  };
  
  const evaluateHand = (evaluatedHand: PokerCard[]): HandRanking => {
    // Convert hand to simple format for evaluation
    const cardValues = evaluatedHand.map(card => card.value);
    const cardSuits = evaluatedHand.map(card => card.suit);
    
    // Check for flush (all cards of the same suit)
    const isFlush = cardSuits.every(suit => suit === cardSuits[0]);
    
    // Count occurrences of each value
    const valueCounts: Record<string, number> = {};
    for (const value of cardValues) {
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    }
    
    // Convert to numeric values for straight check
    const numericValues = cardValues.map(value => {
      if (value === 'A') return 14;
      if (value === 'K') return 13;
      if (value === 'Q') return 12;
      if (value === 'J') return 11;
      return parseInt(value);
    }).sort((a, b) => a - b);
    
    // Check for straight (sequential values)
    let isStraight = true;
    for (let i = 1; i < numericValues.length; i++) {
      if (numericValues[i] !== numericValues[i-1] + 1) {
        isStraight = false;
        break;
      }
    }
    
    // Special case: A-2-3-4-5 straight
    if (!isStraight && numericValues.toString() === '2,3,4,5,14') {
      isStraight = true;
    }
    
    // Get pairs, three of a kind, four of a kind
    const pairs = Object.values(valueCounts).filter(count => count === 2).length;
    const hasThreeOfAKind = Object.values(valueCounts).includes(3);
    const hasFourOfAKind = Object.values(valueCounts).includes(4);
    
    // Check for royal flush
    const isRoyal = isFlush && isStraight && numericValues[0] === 10;
    
    // Determine hand ranking
    if (isFlush && isStraight) {
      return isRoyal ? 'Royal Flush' : 'Straight Flush';
    } else if (hasFourOfAKind) {
      return 'Four of a Kind';
    } else if (hasThreeOfAKind && pairs === 1) {
      return 'Full House';
    } else if (isFlush) {
      return 'Flush';
    } else if (isStraight) {
      return 'Straight';
    } else if (hasThreeOfAKind) {
      return 'Three of a Kind';
    } else if (pairs === 2) {
      return 'Two Pair';
    } else if (pairs === 1 && (valueCounts['J'] === 2 || valueCounts['Q'] === 2 || 
                               valueCounts['K'] === 2 || valueCounts['A'] === 2)) {
      return 'Jacks or Better';
    } else {
      return 'High Card';
    }
  };
  
  const newGame = () => {
    initializeDeck();
    setHand([]);
    setIsDealt(false);
    setIsDrawn(false);
    setHandRank(null);
    setWinnings(0);
  };
  
  const increaseBet = () => {
    if (isDealt || isDrawn) return;
    setBetAmount(prev => Math.min(prev + 5, Math.min(25, coins)));
  };
  
  const decreaseBet = () => {
    if (isDealt || isDrawn) return;
    setBetAmount(prev => Math.max(prev - 5, 5));
  };
  
  const maxBet = () => {
    if (isDealt || isDrawn) return;
    setBetAmount(Math.min(25, coins));
  };
  
  // Helper function to get card color based on suit
  const getCardColor = (suit: Suit) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-slate-900';
  };
  
  // Helper function to get suit symbol
  const getSuitSymbol = (suit: Suit) => {
    switch(suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-casino-gold/30 shadow-lg">
        <CardHeader className="bg-gradient-to-b from-blue-900 to-slate-900 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Video Poker</CardTitle>
            <div className="bg-black/50 rounded-full py-1 px-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-casino-gold" />
              <span className="text-lg font-bold text-casino-gold">{coins}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Paytable */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="p-2 text-left">Hand</th>
                  <th className="p-2 text-center">5</th>
                  <th className="p-2 text-center">10</th>
                  <th className="p-2 text-center">15</th>
                  <th className="p-2 text-center">20</th>
                  <th className="p-2 text-center">25</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PAYOUTS).map(([rank, payouts], index) => (
                  <tr 
                    key={rank} 
                    className={`
                      ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'} 
                      ${handRank === rank ? 'bg-yellow-100' : ''}
                      border-b
                    `}
                  >
                    <td className="p-2 font-medium">{rank}</td>
                    {payouts.map((payout, i) => (
                      <td 
                        key={i} 
                        className={`p-2 text-center ${betAmount === (i + 1) * 5 ? 'bg-blue-100' : ''}`}
                      >
                        {payout === 0 ? '-' : payout}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Betting Controls - Moved to be more prominently displayed */}
          <div className="mb-6 flex justify-center items-center gap-4 bg-blue-100 p-4 rounded-lg shadow-inner">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={decreaseBet} 
              disabled={betAmount <= 5 || isDealt || isDrawn}
              className="border-blue-500 text-blue-700"
            >
              -5
            </Button>
            <div className="text-center">
              <div className="text-blue-800 font-bold text-lg">{betAmount}</div>
              <div className="text-xs text-blue-600">Current Bet</div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={increaseBet} 
              disabled={betAmount >= 25 || betAmount >= coins || isDealt || isDrawn}
              className="border-blue-500 text-blue-700"
            >
              +5
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={maxBet} 
              disabled={betAmount >= 25 || betAmount >= coins || isDealt || isDrawn}
              className="bg-blue-700"
            >
              MAX BET
            </Button>
          </div>
          
          {/* Cards Display */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {hand.length === 0 ? (
              // Card backs when no hand is dealt
              Array(5).fill(null).map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-[3/4] bg-blue-800 rounded-lg shadow-md flex items-center justify-center"
                >
                  <div className="w-2/3 h-2/3 rounded-full border-4 border-dashed border-white/30"></div>
                </div>
              ))
            ) : (
              // Actual cards
              hand.map((card, i) => (
                <div 
                  key={i} 
                  className={`
                    aspect-[3/4] bg-white rounded-lg shadow-md relative cursor-pointer
                    ${card.held ? 'ring-4 ring-yellow-500' : ''}
                    ${isDealt && !isDrawn ? 'hover:bg-yellow-50' : ''}
                  `}
                  onClick={() => toggleHold(i)}
                >
                  <div className="absolute top-2 left-2 font-bold text-xl sm:text-2xl md:text-3xl leading-none">
                    <span className={getCardColor(card.suit)}>{card.value}</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`text-xl sm:text-2xl md:text-3xl ${getCardColor(card.suit)}`}>
                      {getSuitSymbol(card.suit)}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 font-bold text-xl sm:text-2xl md:text-3xl leading-none rotate-180">
                    <span className={getCardColor(card.suit)}>{card.value}</span>
                  </div>
                  <div className="flex items-center justify-center h-full">
                    <span className={`text-4xl sm:text-5xl md:text-6xl ${getCardColor(card.suit)}`}>
                      {getSuitSymbol(card.suit)}
                    </span>
                  </div>
                  
                  {card.held && (
                    <Badge className="absolute bottom-2 left-2 bg-yellow-500">HELD</Badge>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Game Result */}
          {isDrawn && handRank && (
            <div className={`mb-6 p-4 rounded-lg text-center ${winnings > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <h3 className="text-xl font-bold">{handRank}</h3>
              {winnings > 0 ? (
                <p className="text-green-700">You won {winnings} coins!</p>
              ) : (
                <p className="text-red-700">Better luck next time!</p>
              )}
            </div>
          )}
          
          {/* Game Controls */}
          <div className="flex justify-center">
            {!isDealt && !isDrawn ? (
              <Button 
                onClick={dealHand} 
                disabled={isLoading}
                className="bg-green-700 hover:bg-green-800"
              >
                {isLoading ? 'Dealing...' : 'Deal Cards'}
              </Button>
            ) : isDealt && !isDrawn ? (
              <Button 
                onClick={drawCards} 
                disabled={isLoading}
                className="bg-blue-700 hover:bg-blue-800"
              >
                {isLoading ? 'Drawing...' : 'Draw'}
              </Button>
            ) : (
              <Button 
                onClick={newGame}
                className="bg-casino-gold hover:bg-yellow-500 text-black"
              >
                New Game
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoPoker;
