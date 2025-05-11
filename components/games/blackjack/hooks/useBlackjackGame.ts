import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlayingCard, GameState } from '../types';

interface UseBlackjackGameProps {
  user: User | null;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

export const useBlackjackGame = ({ user, coins, setCoins }: UseBlackjackGameProps) => {
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [playerSplitHand, setPlayerSplitHand] = useState<PlayingCard[]>([]);
  const [activeSplitHand, setActiveSplitHand] = useState<boolean>(false);
  const [splitHandCompleted, setSplitHandCompleted] = useState<boolean>(false);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [betAmount, setBetAmount] = useState(25);
  const [message, setMessage] = useState('Place your bet to start');
  const [dealerCardHidden, setDealerCardHidden] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDoubleDown, setIsDoubleDown] = useState(false);
  const [hasPlayerSplit, setHasPlayerSplit] = useState(false);

  // Initialize or reset the deck
  const initializeDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    const newDeck: PlayingCard[] = [];
    
    for (const suit of suits) {
      for (const value of values) {
        let numericValue: number;
        
        if (value === 'A') {
          numericValue = 11;
        } else if (['K', 'Q', 'J'].includes(value)) {
          numericValue = 10;
        } else {
          numericValue = parseInt(value);
        }
        
        newDeck.push({ suit, value, numericValue });
      }
    }
    
    // Shuffle the deck
    return shuffleDeck([...newDeck]);
  };

  // Shuffle the deck
  const shuffleDeck = (deckToShuffle: PlayingCard[]): PlayingCard[] => {
    const shuffled = [...deckToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Draw a card from the deck
  const drawCard = (): PlayingCard => {
    const updatedDeck = [...deck];
    const card = updatedDeck.pop()!;
    setDeck(updatedDeck);
    return card;
  };

  // Calculate the total value of a hand
  const calculateHandValue = (hand: PlayingCard[]): number => {
    let value = 0;
    let aces = 0;
    
    for (const card of hand) {
      if (card.value === 'A') {
        aces += 1;
        value += 11;
      } else {
        value += card.numericValue;
      }
    }
    
    // Adjust for aces if needed
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    
    return value;
  };

  // Check if a hand is a blackjack (21 with 2 cards)
  const isBlackjack = (hand: PlayingCard[]): boolean => {
    return hand.length === 2 && calculateHandValue(hand) === 21;
  };

  // Start a new game
  const startGame = async () => {
    if (coins < betAmount) {
      toast.error("Not enough coins for that bet!");
      return;
    }

    setIsLoading(true);
    
    // Deduct bet amount from balance
    if (user) {
      try {
        const { data, error } = await supabase.rpc('update_balance', {
          user_uuid: user.id,
          amount: -betAmount,
          t_type: 'bet',
          game_name: 'blackjack',
          meta: { bet_amount: betAmount }
        });
        
        if (error) throw error;
        
        setCoins(prevCoins => prevCoins - betAmount);
      } catch (error) {
        console.error('Error placing bet:', error);
        toast.error("Error placing bet. Please try again.");
        setIsLoading(false);
        return;
      }
    } else {
      // For non-authenticated users, just update UI
      setCoins(prevCoins => prevCoins - betAmount);
    }
    
    setIsLoading(false);
    
    // Initialize deck and hands
    const newDeck = initializeDeck();
    const newPlayerHand = [newDeck.pop()!, newDeck.pop()!];
    const newDealerHand = [newDeck.pop()!, newDeck.pop()!];
    
    setDeck(newDeck);
    setPlayerHand(newPlayerHand);
    setPlayerSplitHand([]);
    setDealerHand(newDealerHand);
    setDealerCardHidden(true);
    setGameState('playing');
    setIsDoubleDown(false);
    setHasPlayerSplit(false);
    setActiveSplitHand(false);
    setSplitHandCompleted(false);
    
    const playerValue = calculateHandValue(newPlayerHand);
    const playerHasBlackjack = isBlackjack(newPlayerHand);
    const dealerHasBlackjack = isBlackjack(newDealerHand);
    
    // Check for blackjack
    if (playerHasBlackjack || dealerHasBlackjack) {
      handleDealerTurn(newPlayerHand, newDealerHand);
    } else {
      setMessage(`Your hand: ${playerValue}. Hit, stand, or double down?`);
    }
  };

  // Player hits (takes another card)
  const handleHit = (isSplitHand = false) => {
    const newCard = drawCard();
    
    if (isSplitHand || activeSplitHand) {
      // Add card to split hand
      const newSplitHand = [...playerSplitHand, newCard];
      setPlayerSplitHand(newSplitHand);
      
      const newValue = calculateHandValue(newSplitHand);
      
      if (newValue > 21) {
        // Split hand busted
        setSplitHandCompleted(true);
        setMessage(`Split hand bust! Value: ${newValue}`);
        
        // If this was the active split hand and the main hand is already done, proceed to dealer's turn
        if (activeSplitHand) {
          handleDealerTurn();
        } else {
          // Move to the first hand
          setActiveSplitHand(false);
        }
      } else {
        setMessage(`Split hand: ${newValue}. Hit or stand?`);
      }
    } else {
      // Add card to main hand
      const newPlayerHand = [...playerHand, newCard];
      setPlayerHand(newPlayerHand);
      
      const newValue = calculateHandValue(newPlayerHand);
      
      if (newValue > 21) {
        // Main hand busted
        setMessage(`Bust! Your hand: ${newValue}`);
        
        // If we've split and haven't played the split hand yet, move to it
        if (hasPlayerSplit && !splitHandCompleted) {
          setActiveSplitHand(true);
          const splitValue = calculateHandValue(playerSplitHand);
          setMessage(`First hand busted. Split hand: ${splitValue}. Hit or stand?`);
        } else {
          // Otherwise proceed to dealer's turn
          handleDealerTurn(newPlayerHand);
        }
      } else {
        setMessage(`Your hand: ${newValue}. Hit or stand?`);
      }
    }
  };

  // Player stands (ends turn)
  const handleStand = (isSplitHand = false) => {
    if (isSplitHand || activeSplitHand) {
      // Standing on split hand
      setSplitHandCompleted(true);
      
      // If we're playing the second hand (split hand), proceed to dealer's turn
      if (activeSplitHand) {
        handleDealerTurn();
      } else {
        // If standing on main hand with a split, move to the split hand
        setActiveSplitHand(true);
        const splitValue = calculateHandValue(playerSplitHand);
        setMessage(`Split hand: ${splitValue}. Hit or stand?`);
      }
    } else {
      // Standing on main hand
      if (hasPlayerSplit && !splitHandCompleted) {
        // If we have a split hand to play, move to it
        setActiveSplitHand(true);
        const splitValue = calculateHandValue(playerSplitHand);
        setMessage(`Split hand: ${splitValue}. Hit or stand?`);
      } else {
        // Otherwise proceed to dealer's turn
        handleDealerTurn();
      }
    }
  };

  // Player doubles down
  const handleDoubleDown = async () => {
    if (coins < betAmount) {
      toast.error("Not enough coins to double down!");
      return;
    }
    
    setIsLoading(true);
    
    // Deduct additional bet amount
    if (user) {
      try {
        const { data, error } = await supabase.rpc('update_balance', {
          user_uuid: user.id,
          amount: -betAmount,
          t_type: 'bet',
          game_name: 'blackjack',
          meta: { bet_amount: betAmount, action: 'double_down' }
        });
        
        if (error) throw error;
        
        setCoins(prevCoins => prevCoins - betAmount);
      } catch (error) {
        console.error('Error placing double down bet:', error);
        toast.error("Error doubling down. Please try again.");
        setIsLoading(false);
        return;
      }
    } else {
      // For non-authenticated users, just update UI
      setCoins(prevCoins => prevCoins - betAmount);
    }
    
    setIsLoading(false);
    setIsDoubleDown(true);
    
    // Draw one more card and then stand
    const newCard = drawCard();
    const newPlayerHand = [...playerHand, newCard];
    setPlayerHand(newPlayerHand);
    
    const newValue = calculateHandValue(newPlayerHand);
    
    if (newValue > 21) {
      setMessage(`Bust! Your hand: ${newValue}`);
      handleDealerTurn(newPlayerHand);
    } else {
      setMessage(`Double down! Your hand: ${newValue}`);
      handleDealerTurn(newPlayerHand);
    }
  };

  // Player splits pair
  const handleSplit = async () => {
    // Check if splitting is allowed
    if (playerHand.length !== 2 || playerHand[0].value !== playerHand[1].value) {
      toast.error("You can only split a pair of same-value cards!");
      return;
    }
    
    if (coins < betAmount) {
      toast.error("Not enough coins to split!");
      return;
    }
    
    setIsLoading(true);
    
    // Deduct additional bet amount
    if (user) {
      try {
        const { data, error } = await supabase.rpc('update_balance', {
          user_uuid: user.id,
          amount: -betAmount,
          t_type: 'bet',
          game_name: 'blackjack',
          meta: { bet_amount: betAmount, action: 'split' }
        });
        
        if (error) throw error;
        
        setCoins(prevCoins => prevCoins - betAmount);
      } catch (error) {
        console.error('Error placing split bet:', error);
        toast.error("Error splitting. Please try again.");
        setIsLoading(false);
        return;
      }
    } else {
      // For non-authenticated users, just update UI
      setCoins(prevCoins => prevCoins - betAmount);
    }
    
    setIsLoading(false);
    setHasPlayerSplit(true);
    setGameState('splitting');
    
    // Split the hand into two hands
    const card1 = playerHand[0];
    const card2 = playerHand[1];
    
    // Draw a new card for each hand
    const newCard1 = drawCard();
    const newCard2 = drawCard();
    
    setPlayerHand([card1, newCard1]);
    setPlayerSplitHand([card2, newCard2]);
    
    const hand1Value = calculateHandValue([card1, newCard1]);
    const hand2Value = calculateHandValue([card2, newCard2]);
    
    // Set state for split hands
    setActiveSplitHand(false);  // Start with first hand
    setSplitHandCompleted(false);
    
    setMessage(`Split into two hands. First hand: ${hand1Value}. Hit or stand?`);
    
    // Check for blackjack in either hand
    if (hand1Value === 21 && hand2Value === 21) {
      // Both hands have blackjack after split
      handleDealerTurn();
    } else if (hand1Value === 21) {
      // First hand has blackjack, play second hand
      setActiveSplitHand(true);
      setMessage(`First hand: Blackjack! Second hand: ${hand2Value}. Hit or stand?`);
    } else if (hand2Value === 21) {
      // Second hand has blackjack, play first hand
      setMessage(`First hand: ${hand1Value}. Hit or stand? Second hand: Blackjack!`);
    }
    
    // Force a state update to ensure the UI refreshes
    setGameState('playing');
  };

  // Handle split results
  const handleSplitResult = async (hand1: PlayingCard[], hand2: PlayingCard[], dealerHand: PlayingCard[]) => {
    const hand1Value = calculateHandValue(hand1);
    const hand2Value = calculateHandValue(hand2);
    const dealerValue = calculateHandValue(dealerHand);
    
    let hand1Result: boolean | null = null;
    let hand2Result: boolean | null = null;
    let netWinnings = 0;
    let resultMessage = '';
    
    // Determine hand 1 result
    if (hand1Value > 21) {
      hand1Result = false;
      resultMessage += "Hand 1: Bust. ";
    } else if (dealerValue > 21 || hand1Value > dealerValue) {
      hand1Result = true;
      netWinnings += betAmount * 2;
      resultMessage += `Hand 1: Win (${hand1Value} vs ${dealerValue}). `;
    } else if (hand1Value < dealerValue) {
      hand1Result = false;
      resultMessage += `Hand 1: Loss (${hand1Value} vs ${dealerValue}). `;
    } else {
      hand1Result = null;
      netWinnings += betAmount;
      resultMessage += `Hand 1: Push (${hand1Value}). `;
    }
    
    // Determine hand 2 result
    if (hand2Value > 21) {
      hand2Result = false;
      resultMessage += "Hand 2: Bust. ";
    } else if (dealerValue > 21 || hand2Value > dealerValue) {
      hand2Result = true;
      netWinnings += betAmount * 2;
      resultMessage += `Hand 2: Win (${hand2Value} vs ${dealerValue}). `;
    } else if (hand2Value < dealerValue) {
      hand2Result = false;
      resultMessage += `Hand 2: Loss (${hand2Value} vs ${dealerValue}). `;
    } else {
      hand2Result = null;
      netWinnings += betAmount;
      resultMessage += `Hand 2: Push (${hand2Value}). `;
    }
    
    if (netWinnings > 0) {
      resultMessage += `Total won: ${netWinnings} coins.`;
      
      if (user) {
        try {
          // Record the split result
          const { error } = await supabase.rpc('update_balance', {
            user_uuid: user.id,
            amount: netWinnings,
            t_type: 'win',
            game_name: 'blackjack',
            meta: {
              hand1_value: hand1Value,
              hand2_value: hand2Value,
              dealer_value: dealerValue,
              hand1_result: hand1Result ? 'win' : hand1Result === false ? 'loss' : 'push',
              hand2_result: hand2Result ? 'win' : hand2Result === false ? 'loss' : 'push',
              was_split: true,
              bet_amount: betAmount
            }
          });
          
          if (error) throw error;
          
          setCoins(prevCoins => prevCoins + netWinnings);
        } catch (error) {
          console.error('Error updating balance:', error);
          toast.error("Error updating balance. Please contact support.");
        }
      } else {
        // For non-authenticated users
        setCoins(prevCoins => prevCoins + netWinnings);
      }
    }
    
    setMessage(resultMessage);
    setGameState('gameOver');
  };

  // Dealer's turn
  const handleDealerTurn = async (finalPlayerHand = playerHand, initialDealerHand = dealerHand) => {
    setGameState('dealerTurn');
    setDealerCardHidden(false);

    let currentDealerHand = [...initialDealerHand];
    const playerValue = calculateHandValue(finalPlayerHand);
    const splitValue = hasPlayerSplit ? calculateHandValue(playerSplitHand) : 0;
    
    // Player busted both hands
    if (playerValue > 21 && (!hasPlayerSplit || splitValue > 21)) {
      endGame(false, finalPlayerHand, currentDealerHand);
      return;
    }

    // Check for blackjacks
    const playerHasBlackjack = isBlackjack(finalPlayerHand);
    const dealerHasBlackjack = isBlackjack(currentDealerHand);
    
    if (playerHasBlackjack && dealerHasBlackjack && !hasPlayerSplit) {
      // Both have blackjack - push
      endGame(null, finalPlayerHand, currentDealerHand);
      return;
    } else if (playerHasBlackjack && !hasPlayerSplit) {
      // Player has blackjack, dealer doesn't - player wins 1.5x
      endGame(true, finalPlayerHand, currentDealerHand, true);
      return;
    } else if (dealerHasBlackjack && !playerHasBlackjack) {
      // Dealer has blackjack, player doesn't - dealer wins
      endGame(false, finalPlayerHand, currentDealerHand);
      return;
    }
    
    // Dealer draws until reaching 17 or higher
    let dealerValue = calculateHandValue(currentDealerHand);
    
    // Simulate dealer drawing cards with a delay
    const drawDealer = async () => {
      while (dealerValue < 17) {
        await new Promise(resolve => setTimeout(resolve, 700));
        const newCard = drawCard();
        currentDealerHand = [...currentDealerHand, newCard];
        setDealerHand(currentDealerHand);
        dealerValue = calculateHandValue(currentDealerHand);
      }
      
      // Determine the winner
      if (hasPlayerSplit) {
        handleSplitResult(finalPlayerHand, playerSplitHand, currentDealerHand);
      } else {
        if (playerValue > 21) {
          // Player busts
          endGame(false, finalPlayerHand, currentDealerHand);
        } else if (dealerValue > 21) {
          // Dealer busts, player wins
          endGame(true, finalPlayerHand, currentDealerHand);
        } else if (dealerValue > playerValue) {
          // Dealer has higher hand, dealer wins
          endGame(false, finalPlayerHand, currentDealerHand);
        } else if (playerValue > dealerValue) {
          // Player has higher hand, player wins
          endGame(true, finalPlayerHand, currentDealerHand);
        } else {
          // Equal values, push
          endGame(null, finalPlayerHand, currentDealerHand);
        }
      }
    };
    
    drawDealer();
  };

  // End the game and determine the outcome
  const endGame = async (
    playerWins: boolean | null, 
    finalPlayerHand: PlayingCard[], 
    finalDealerHand: PlayingCard[],
    isBlackjackWin: boolean = false
  ) => {
    setGameState('gameOver');
    setDealerCardHidden(false);
    
    const playerValue = calculateHandValue(finalPlayerHand);
    const dealerValue = calculateHandValue(finalDealerHand);
    
    let winnings = 0;
    let resultMessage = '';

    if (playerWins === null) {
      // Push - return the bet
      resultMessage = `Push! Both you and the dealer have ${playerValue}. Bet returned.`;
      winnings = betAmount;
    } else if (playerWins) {
      if (isBlackjackWin) {
        // Blackjack pays 3:2
        winnings = Math.floor(betAmount * 2.5);
        resultMessage = `Blackjack! You win ${winnings} coins!`;
      } else if (isDoubleDown) {
        // Double down win pays 2x the doubled bet
        winnings = betAmount * 4;
        resultMessage = `Double Down Win! You win ${winnings} coins!`;
      } else {
        // Regular win pays 1:1
        winnings = betAmount * 2;
        resultMessage = `You win with ${playerValue} vs dealer's ${dealerValue}! You win ${winnings} coins!`;
      }
    } else {
      if (isDoubleDown) {
        resultMessage = `Double Down Loss! You lost ${betAmount * 2} coins.`;
      } else {
        resultMessage = playerValue > 21 
          ? `Bust with ${playerValue}! Dealer wins.` 
          : `Dealer wins with ${dealerValue} vs your ${playerValue}.`;
      }
      winnings = 0;
    }
    
    setMessage(resultMessage);
    
    // Update balance if player won or tied
    if (winnings > 0) {
      setIsLoading(true);
      
      if (user) {
        try {
          const { data, error } = await supabase.rpc('update_balance', {
            user_uuid: user.id,
            amount: winnings,
            t_type: 'win',
            game_name: 'blackjack',
            meta: { 
              bet_amount: isDoubleDown ? betAmount * 2 : betAmount,
              player_hand: finalPlayerHand.map(card => `${card.value}${card.suit[0]}`).join(','),
              dealer_hand: finalDealerHand.map(card => `${card.value}${card.suit[0]}`).join(','),
              player_score: playerValue,
              dealer_score: dealerValue,
              is_blackjack: isBlackjackWin,
              is_double_down: isDoubleDown
            }
          });
          
          if (error) throw error;
          
          // Also record game result
          const { error: resultError } = await supabase.from('game_results').insert({
            user_id: user.id,
            game: 'blackjack',
            bet_amount: isDoubleDown ? betAmount * 2 : betAmount,
            win_amount: winnings,
            is_win: playerWins === true,
            game_data: {
              player_hand: finalPlayerHand.map(card => `${card.value}${card.suit[0]}`),
              dealer_hand: finalDealerHand.map(card => `${card.value}${card.suit[0]}`),
              player_score: playerValue,
              dealer_score: dealerValue,
              is_blackjack: isBlackjackWin,
              is_double_down: isDoubleDown
            }
          });
          
          if (resultError) throw resultError;
          
          setCoins(prevCoins => prevCoins + winnings);
        } catch (error) {
          console.error('Error updating balance:', error);
          toast.error("Error updating balance. Please contact support.");
        }
      } else {
        // For non-authenticated users, just update UI
        setCoins(prevCoins => prevCoins + winnings);
      }
      
      setIsLoading(false);
    } else if (user) {
      // Record loss
      try {
        const { error: resultError } = await supabase.from('game_results').insert({
          user_id: user.id,
          game: 'blackjack',
          bet_amount: isDoubleDown ? betAmount * 2 : betAmount,
          win_amount: 0,
          is_win: false,
          game_data: {
            player_hand: finalPlayerHand.map(card => `${card.value}${card.suit[0]}`),
            dealer_hand: finalDealerHand.map( card => `${card.value}${card.suit[0]}`),
            player_score: playerValue,
            dealer_score: dealerValue,
            is_double_down: isDoubleDown
          }
        });
        
        if (resultError) throw resultError;
      } catch (error) {
        console.error('Error recording game result:', error);
      }
    }
  };

  // Change bet amount
  const handleBetChange = (amount: number) => {
    if (gameState !== 'betting') return;
    
    const newAmount = Math.max(5, Math.min(coins, betAmount + amount));
    setBetAmount(newAmount);
  };

  // Check if hand can be split
  const canSplit = () => {
    return (
      gameState === 'playing' && 
      playerHand.length === 2 && 
      playerHand[0].value === playerHand[1].value && 
      !hasPlayerSplit &&
      coins >= betAmount
    );
  };

  // Check if hand can be doubled down
  const canDoubleDown = () => {
    return (
      gameState === 'playing' && 
      playerHand.length === 2 && 
      !hasPlayerSplit &&
      !isDoubleDown &&
      coins >= betAmount
    );
  };

  // Reset the game
  const resetGame = () => {
    setGameState('betting');
    setMessage('Place your bet to start');
    setPlayerHand([]);
    setPlayerSplitHand([]);
    setDealerHand([]);
    setHasPlayerSplit(false);
    setIsDoubleDown(false);
    setActiveSplitHand(false);
    setSplitHandCompleted(false);
  };

  // Initialize when component mounts
  useEffect(() => {
    setDeck(initializeDeck());
  }, []);

  return {
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
  };
};
