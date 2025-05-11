
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSampleEvents } from '@/data/sportsbookData';
import { SportEvent, SportsBet } from '@/types/slots';
import { useAuth } from '@/context/AuthContext';
import { UserPreferences } from '@/types/database';
import { toast } from 'sonner';
import { 
  CURRENCY_CONFIG, 
  saveCurrencyPreference 
} from '@/services/sportsbookService';
import { fetchRealSportsEvents, updateLiveScores } from '@/services/sportsApi';

export const useSportsbook = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [bets, setBets] = useState<SportsBet[]>([]);
  const [balance, setBalance] = useState<number>(1000);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('soccer');
  const [currency, setCurrency] = useState<'waynebucks' | 'waynesweeps'>('waynebucks');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    preferredCurrency: 'waynebucks',
    darkMode: true,
    soundEffects: true,
    notifications: true
  });
  
  // Use a ref to safely track the interval ID
  const intervalRef = useRef<number | null>(null);
  
  // Handle currency change - updated to use service function
  const handleCurrencyChange = async (newCurrency: 'waynebucks' | 'waynesweeps') => {
    setCurrency(newCurrency);
    
    // Update local preferences state
    const updatedPreferences = { 
      ...userPreferences, 
      preferredCurrency: newCurrency 
    };
    
    setUserPreferences(updatedPreferences);
    
    // Update stats display based on currency switch
    console.log(`Switched to ${newCurrency}. House edge: ${(CURRENCY_CONFIG[newCurrency].HOUSE_EDGE * 100).toFixed(1)}%, RTP: ${(CURRENCY_CONFIG[newCurrency].RTP_CAP * 100).toFixed(1)}%`);
    
    // Save to user profile if logged in
    if (user) {
      const saved = await saveCurrencyPreference(user.id, newCurrency, userPreferences);
      
      if (saved) {
        toast.success(`Switched to ${newCurrency === 'waynebucks' ? 'WayneBucks' : 'WayneSweeps'}`);
      } else {
        toast.error('Failed to save your currency preference');
      }
    }
  };
  
  // Load events and user balance
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch real sports data from API
      const realEvents = await fetchRealSportsEvents();
      
      // Use sample data as fallback if API fails or returns empty
      const sportsEvents = realEvents.length > 0 ? realEvents : getSampleEvents();
      setEvents(sportsEvents);
      
      // Get user balance and preferences if logged in
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('balance, preferences')
            .eq('id', user.id)
            .single();
            
          if (data) {
            setBalance(data.balance);
            
            // Handle the preferences data properly
            if (data.preferences && typeof data.preferences === 'object') {
              const prefs = data.preferences as any;
              
              // Build a complete preferences object with defaults for missing fields
              const loadedPreferences: UserPreferences = {
                preferredCurrency: prefs.preferredCurrency || 'waynebucks',
                darkMode: prefs.darkMode !== undefined ? prefs.darkMode : true,
                soundEffects: prefs.soundEffects !== undefined ? prefs.soundEffects : true,
                notifications: prefs.notifications !== undefined ? prefs.notifications : true
              };
              
              // Update both state variables
              setUserPreferences(loadedPreferences);
              setCurrency(loadedPreferences.preferredCurrency);
            }
          }
        } catch (error) {
          console.error('Error loading user balance and preferences:', error);
        }
      }
      
      setLoading(false);
    };
    
    fetchData();
    
    // Set up periodic refresh for live events using a ref to track the interval
    intervalRef.current = window.setInterval(() => {
      setEvents(prev => updateLiveScores(prev));
    }, 30000); // Update every 30 seconds
    
    // Clean up the interval on unmount using the ref
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user]);
  
  // Filter events
  const upcomingEvents = events.filter(e => e.status === 'scheduled');
  const liveEvents = events.filter(e => e.status === 'live');
  
  return {
    activeTab,
    setActiveTab,
    events,
    bets,
    setBets,
    balance,
    setBalance,
    betAmount,
    setBetAmount,
    loading,
    activeCategoryId,
    setActiveCategoryId,
    currency,
    handleCurrencyChange,
    upcomingEvents,
    liveEvents,
    user,
    userPreferences,
  };
};
