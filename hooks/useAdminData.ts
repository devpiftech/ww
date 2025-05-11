
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { GameConfig, SlotMachineConfig, AdminStats } from '@/types/admin';

const defaultConfigs: GameConfig[] = [
  {
    id: 'blackjack',
    name: 'Blackjack',
    min_bet: 5,
    max_bet: 1000,
    enabled: true,
    rtp: 99.5,
    house_edge: 0.5,
    payouts: {
      'blackjack': 1.5,
      'regular': 1,
      'insurance': 2
    }
  },
  {
    id: 'roulette-us',
    name: 'American Roulette',
    min_bet: 5,
    max_bet: 1000,
    enabled: true,
    rtp: 94.74,
    house_edge: 5.26,
    payouts: {
      'straight': 35,
      'split': 17,
      'street': 11,
      'corner': 8,
      'sixline': 5,
      'column': 2,
      'dozen': 2,
      'red': 1,
      'black': 1,
      'odd': 1,
      'even': 1,
      'high': 1,
      'low': 1
    }
  },
  {
    id: 'roulette-eu',
    name: 'European Roulette',
    min_bet: 5,
    max_bet: 1000,
    enabled: true,
    rtp: 97.3,
    house_edge: 2.7,
    payouts: {
      'straight': 35,
      'split': 17,
      'street': 11,
      'corner': 8,
      'sixline': 5,
      'column': 2,
      'dozen': 2,
      'red': 1,
      'black': 1,
      'odd': 1,
      'even': 1,
      'high': 1,
      'low': 1
    }
  },
  {
    id: 'highlow',
    name: 'High Low',
    min_bet: 5,
    max_bet: 500,
    enabled: true,
    rtp: 98.0,
    house_edge: 2.0,
    payouts: {
      'win': 1
    }
  },
  {
    id: 'cointoss',
    name: 'Coin Toss',
    min_bet: 5,
    max_bet: 500,
    enabled: true,
    rtp: 97.0,
    house_edge: 3.0,
    payouts: {
      'win': 1.94
    }
  },
  {
    id: 'dice',
    name: 'Casino Dice',
    min_bet: 5,
    max_bet: 500,
    enabled: true,
    rtp: 98.6,
    house_edge: 1.4,
    payouts: {
      'number': 5,
      'range': 1
    }
  },
  {
    id: 'racing',
    name: 'Virtual Racing',
    min_bet: 10,
    max_bet: 1000,
    enabled: true,
    rtp: 92.0,
    house_edge: 8.0,
    payouts: {
      'win': 4.5,
      'place': 1.8,
      'show': 1.2
    }
  },
  {
    id: 'picknumber',
    name: 'Lucky Number',
    min_bet: 5,
    max_bet: 100,
    enabled: true,
    rtp: 90.0,
    house_edge: 10.0,
    payouts: {
      'exact': 9,
      'adjacent': 2
    }
  }
];

const defaultSlotConfigs: SlotMachineConfig[] = [
  {
    id: 'slot-classic',
    name: 'Classic Slots',
    min_bet: 1,
    max_bet: 100,
    enabled: true,
    rtp: 96.0,
    house_edge: 4.0,
    slot_type: 'classic',
    reels: 3,
    symbols_per_reel: 5,
    bonus_frequency: 5.0,
    jackpot_seed: 0,
    jackpot_contribution: 0,
    special_features: ['wild_substitutions', 'scatter_pays'],
    symbol_weights: {
      'cherry': 25,
      'lemon': 25,
      'orange': 20,
      'plum': 15,
      'bell': 10,
      'seven': 5
    },
    payouts: {
      'three_seven': 50,
      'three_bell': 25,
      'three_plum': 15,
      'three_orange': 10,
      'three_lemon': 5,
      'three_cherry': 3,
      'two_seven': 2,
      'two_bell': 1
    }
  },
  {
    id: 'slot-fruity',
    name: 'Fruity Slots',
    min_bet: 1,
    max_bet: 200,
    enabled: true,
    rtp: 95.5,
    house_edge: 4.5,
    slot_type: 'fruity',
    reels: 5,
    symbols_per_reel: 4,
    bonus_frequency: 7.5,
    jackpot_seed: 0,
    jackpot_contribution: 0,
    special_features: ['wild_substitutions', 'free_spins', 'multipliers'],
    symbol_weights: {
      'strawberry': 20,
      'banana': 20,
      'apple': 20,
      'watermelon': 15,
      'pineapple': 15,
      'wild_fruit': 10
    },
    payouts: {
      'five_wild_fruit': 200,
      'four_wild_fruit': 50,
      'three_wild_fruit': 20,
      'five_watermelon': 100,
      'four_watermelon': 25,
      'three_watermelon': 10,
      'five_of_kind': 75,
      'four_of_kind': 15,
      'three_of_kind': 5
    }
  },
  {
    id: 'slot-space',
    name: 'Space Slots',
    min_bet: 5,
    max_bet: 500,
    enabled: true,
    rtp: 95.0,
    house_edge: 5.0,
    slot_type: 'space',
    reels: 5,
    symbols_per_reel: 4,
    bonus_frequency: 6.0,
    jackpot_seed: 0,
    jackpot_contribution: 0,
    special_features: ['wild_substitutions', 'free_spins', 'cascading_reels', 'expanding_wilds'],
    symbol_weights: {
      'planet': 25,
      'rocket': 20,
      'astronaut': 20,
      'alien': 15,
      'ufo': 10,
      'black_hole': 10
    },
    payouts: {
      'five_black_hole': 250,
      'four_black_hole': 50,
      'three_black_hole': 15,
      'five_ufo': 125,
      'four_ufo': 25,
      'three_ufo': 10,
      'five_alien': 75,
      'four_alien': 15,
      'three_alien': 5,
      'five_any': 50,
      'four_any': 10,
      'three_any': 3
    }
  },
  {
    id: 'slot-jackpot',
    name: 'Jackpot Slots',
    min_bet: 10,
    max_bet: 1000,
    enabled: true,
    rtp: 94.0,
    house_edge: 6.0,
    slot_type: 'jackpot',
    reels: 5,
    symbols_per_reel: 3,
    bonus_frequency: 4.0,
    jackpot_seed: 10000,
    jackpot_contribution: 2.5,
    special_features: ['wild_substitutions', 'scatter_pays', 'free_spins', 'bonus_game', 'multipliers'],
    symbol_weights: {
      'diamond': 5,
      'crown': 10,
      'gold_bar': 15,
      'ruby': 20,
      'emerald': 25,
      'sapphire': 25
    },
    payouts: {
      'five_diamond': 1000,
      'four_diamond': 250,
      'three_diamond': 50,
      'five_crown': 500,
      'four_crown': 100,
      'three_crown': 25,
      'five_gold_bar': 250,
      'four_gold_bar': 50,
      'three_gold_bar': 15,
      'five_jewels': 100,
      'four_jewels': 25,
      'three_jewels': 5,
      'mega_jackpot': 'progressive',
      'mini_jackpot': 1000
    }
  }
];

export const useAdminData = (isAdmin: boolean) => {
  const [gameConfigs, setGameConfigs] = useState<GameConfig[]>(defaultConfigs);
  const [slotConfigs, setSlotConfigs] = useState<SlotMachineConfig[]>(defaultSlotConfigs);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalBets: 0,
    totalWagered: 0,
    grossRevenue: 0,
    houseEdge: 0
  });
  
  // Load users, transactions and statistics when admin is authenticated
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchUsersAndData = async () => {
      try {
        // Fetch users
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (userError) throw userError;
        setUsers(userData || []);
        
        // Fetch transactions
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (transactionError) throw transactionError;
        setTransactions(transactionData || []);
        
        // Calculate statistics
        if (userData) {
          const totalWagered = transactionData
            ?.filter(t => t.type === 'bet')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
          
          const winnings = transactionData
            ?.filter(t => t.type === 'win')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
          
          setStatistics({
            totalUsers: userData.length,
            activeUsers: userData.filter(u => {
              // Consider users active if they were created in the last week
              const createdDate = new Date(u.created_at);
              return createdDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            }).length,
            totalBets: transactionData?.filter(t => t.type === 'bet').length || 0,
            totalWagered,
            grossRevenue: totalWagered - winnings,
            houseEdge: totalWagered > 0 ? ((totalWagered - winnings) / totalWagered) * 100 : 0
          });
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin data');
      }
    };
    
    fetchUsersAndData();
  }, [isAdmin]);
  
  // Save game configuration
  const saveConfig = (config: GameConfig) => {
    // In a real app, you'd save this to a database
    setGameConfigs(prev => 
      prev.map(c => c.id === config.id ? config : c)
    );
    toast.success(`${config.name} settings updated`);
  };

  // Toggle game status
  const toggleGameStatus = (gameId: string, enabled: boolean) => {
    setGameConfigs(prev => 
      prev.map(c => c.id === gameId ? { ...c, enabled } : c)
    );
    toast.success(`Game ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  // Save slot machine configuration
  const saveSlotConfig = (config: SlotMachineConfig) => {
    // In a real app, you'd save this to a database
    setSlotConfigs(prev => 
      prev.map(c => c.id === config.id ? config : c)
    );
    toast.success(`${config.name} settings updated`);
  };

  // Toggle slot machine status
  const toggleSlotStatus = (gameId: string, enabled: boolean) => {
    setSlotConfigs(prev => 
      prev.map(c => c.id === gameId ? { ...c, enabled } : c)
    );
    toast.success(`Slot machine ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  return {
    gameConfigs,
    slotConfigs,
    users,
    transactions,
    statistics,
    saveConfig,
    toggleGameStatus,
    saveSlotConfig,
    toggleSlotStatus
  };
};
