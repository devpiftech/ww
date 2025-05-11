
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BaseSlotMachine from './BaseSlotMachine';
import SpaceHeader from './space/SpaceHeader';
import SpaceFeatures from './space/SpaceFeatures';
import { SPACE_SYMBOLS } from './space/SpaceSymbols';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const SpaceSlotMachine: React.FC = () => {
  const [coins, setCoins] = useState(1000);
  const { user } = useAuth();
  
  useEffect(() => {
    // Fetch user balance when component mounts
    const fetchBalance = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single();
            
          if (!error && data) {
            setCoins(data.balance);
          }
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      }
    };
    
    fetchBalance();
  }, [user]);
  
  const handleWin = (amount: number) => {
    console.log(`Won ${amount} coins`);
  };

  const handleAddCoins = async () => {
    // Add coins to user balance in database
    if (user) {
      try {
        const { data, error } = await supabase.rpc('update_balance', {
          user_uuid: user.id,
          amount: 1000,
          t_type: 'purchase',
          game_name: 'Cosmic Cash',
          meta: { source: 'slot-bonus' }
        });
        
        if (!error) {
          setCoins(prev => prev + 1000);
          toast.success('1000 coins added to your balance!');
        } else {
          console.error('Error adding coins:', error);
          toast.error('Failed to add coins. Please try again.');
        }
      } catch (err) {
        console.error('Error adding coins:', err);
        toast.error('Failed to add coins. Please try again.');
      }
    } else {
      // If user is not logged in, just update the local state
      setCoins(prev => prev + 1000);
      toast.success('1000 coins added to your balance!');
    }
  };
  
  return (
    <Layout>
      <SpaceHeader title="Cosmic Cash" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-b from-indigo-900 to-black/80 p-6 rounded-lg shadow-lg">
            <BaseSlotMachine 
              initialCoins={coins} 
              symbols={SPACE_SYMBOLS} 
              reels={5} 
              rows={3}
              minBet={50}
              maxBet={500}
              onWin={handleWin}
              machineName="Cosmic Cash" 
              onSaveBalance={setCoins}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <SpaceFeatures 
            coins={coins} 
            onAddCoins={handleAddCoins} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default SpaceSlotMachine;
