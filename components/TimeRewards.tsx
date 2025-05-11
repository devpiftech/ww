
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Coins, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TimeReward, UserPreferences } from '@/types/database';
import CurrencyToggle from './CurrencyToggle';

const TimeRewards: React.FC = () => {
  const { user } = useAuth();
  const [timeToNextReward, setTimeToNextReward] = useState<number>(0);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [claimCount, setClaimCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currencyType, setCurrencyType] = useState<'waynebucks' | 'waynesweeps'>('waynebucks');
  const [preferences, setPreferences] = useState<UserPreferences>({
    darkMode: true,
    notifications: true,
    soundEffects: true,
    preferredCurrency: 'waynebucks',
  });
  
  const REWARD_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  const MAX_CLAIMS_PER_DAY = 6;

  useEffect(() => {
    if (!user) return;
    
    // Fetch user preferences
    const fetchUserPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();
        
        if (!error && data && data.preferences) {
          const userPrefs = data.preferences as any;
          setPreferences({
            darkMode: userPrefs.darkMode ?? true,
            notifications: userPrefs.notifications ?? true,
            soundEffects: userPrefs.soundEffects ?? true,
            preferredCurrency: userPrefs.preferredCurrency ?? 'waynebucks'
          });
          setCurrencyType(userPrefs.preferredCurrency ?? 'waynebucks');
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };
    
    const fetchRewardStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('time_rewards')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" error
          console.error('Error fetching reward status:', error);
          return;
        }
        
        const reward = data as TimeReward | null;
        
        if (reward) {
          const lastClaimed = new Date(reward.last_claimed).getTime();
          const now = Date.now();
          const timeSinceClaim = now - lastClaimed;
          
          setClaimCount(reward.claim_count);
          setCurrencyType(reward.currency_type as 'waynebucks' | 'waynesweeps');
          
          if (timeSinceClaim >= REWARD_INTERVAL && reward.claim_count < MAX_CLAIMS_PER_DAY) {
            setCanClaim(true);
            setTimeToNextReward(0);
          } else if (reward.claim_count >= MAX_CLAIMS_PER_DAY) {
            // Reset count at midnight
            const tomorrow = new Date();
            tomorrow.setHours(0, 0, 0, 0);
            tomorrow.setDate(tomorrow.getDate() + 1);
            setTimeToNextReward(tomorrow.getTime() - now);
            setCanClaim(false);
          } else {
            setTimeToNextReward(REWARD_INTERVAL - timeSinceClaim);
            setCanClaim(false);
          }
        } else {
          // First time user
          setCanClaim(true);
          setClaimCount(0);
        }
      } catch (error) {
        console.error('Error in fetchRewardStatus:', error);
      }
    };
    
    fetchUserPreferences();
    fetchRewardStatus();
    
    const timer = setInterval(() => {
      if (timeToNextReward > 1000) {
        setTimeToNextReward(prev => prev - 1000);
      } else if (timeToNextReward > 0) {
        setTimeToNextReward(0);
        setCanClaim(true);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [user, timeToNextReward]);
  
  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleCurrencyToggle = (currency: 'waynebucks' | 'waynesweeps') => {
    setCurrencyType(currency);
  };
  
  const handleClaimReward = async () => {
    if (!user || !canClaim) return;
    
    setIsLoading(true);
    
    try {
      // Determine reward amount based on currency type
      const rewardAmount = currencyType === 'waynebucks' ? 100 : 50;
      
      // Update user balance
      const { error: balanceError } = await supabase.functions.invoke('update-balance', {
        body: {
          user_id: user.id,
          amount: rewardAmount,
          type: 'reward',
          metadata: {
            reward_type: 'time_based',
            currency_type: currencyType
          }
        }
      });
      
      if (balanceError) {
        throw new Error('Failed to update balance');
      }
      
      // Update time rewards tracking
      const newClaimCount = claimCount + 1;
      
      // Using upsert to handle both insert and update
      const { error: rewardError } = await supabase
        .from('time_rewards')
        .upsert({
          user_id: user.id,
          last_claimed: new Date().toISOString(),
          claim_count: newClaimCount,
          currency_type: currencyType
        }, {
          onConflict: 'user_id'
        });
      
      if (rewardError) {
        throw new Error('Failed to update reward status');
      }
      
      setClaimCount(newClaimCount);
      setCanClaim(false);
      setTimeToNextReward(REWARD_INTERVAL);
      
      toast.success(`Claimed ${rewardAmount} ${currencyType === 'waynebucks' ? 'WayneBucks' : 'WayneSweeps'}!`, {
        description: `You've claimed ${newClaimCount}/${MAX_CLAIMS_PER_DAY} rewards today.`
      });
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="bg-card border-border/30 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-casino-gold" />
          Time-Based Rewards
        </CardTitle>
        <CardDescription>
          Claim rewards every 4 hours, up to 6 times daily
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm">Next Reward:</div>
          <div className={`font-mono ${canClaim ? 'text-casino-gold' : 'text-muted-foreground'}`}>
            {canClaim ? 'Ready to claim!' : formatTimeRemaining(timeToNextReward)}
          </div>
        </div>
        
        <Progress 
          value={canClaim ? 100 : 100 - (timeToNextReward / REWARD_INTERVAL * 100)} 
          className="h-2" 
          color={canClaim ? 'bg-casino-gold' : undefined}
        />
        
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <div>Claims Today: {claimCount}/{MAX_CLAIMS_PER_DAY}</div>
          <div>Resets at midnight</div>
        </div>
        
        <div className="mt-4">
          <div className="mb-3">
            <CurrencyToggle 
              preferences={{ ...preferences, preferredCurrency: currencyType }}
              onToggle={handleCurrencyToggle}
              size="sm"
            />
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className={currencyType === 'waynebucks' ? 'text-casino-gold' : 'text-casino-purple'} />
                <div>
                  <div className="font-medium">
                    {currencyType === 'waynebucks' ? 'WayneBucks' : 'WayneSweeps'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currencyType === 'waynebucks' 
                      ? 'Used for all games' 
                      : 'For sweepstakes entries only'}
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold">
                {currencyType === 'waynebucks' ? '+100' : '+50'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full casino-btn" 
          onClick={handleClaimReward}
          disabled={!canClaim || isLoading}
        >
          {isLoading ? 'Claiming...' : canClaim ? 'Claim Reward' : 'Wait for Next Reward'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TimeRewards;
