
import React from 'react';
import { User } from '@supabase/supabase-js';
import BlackjackGame from './blackjack/BlackjackGame';

interface BlackjackProps {
  user: User | null;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

const Blackjack: React.FC<BlackjackProps> = ({ user, coins, setCoins }) => {
  return <BlackjackGame user={user} coins={coins} setCoins={setCoins} />;
};

export default Blackjack;
