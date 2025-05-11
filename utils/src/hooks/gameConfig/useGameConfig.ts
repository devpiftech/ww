
import { useState, useEffect } from 'react';
import { fetchGameConfigs, fetchSlotConfigs } from './gameConfigService';
import { GameConfig, SlotMachineConfig } from '@/types/admin';
import { UseGameConfigProps, GameConfigResult } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useGameConfig = ({ gameId, isSlotMachine = false }: UseGameConfigProps): GameConfigResult => {
  const [config, setConfig] = useState<GameConfig | SlotMachineConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (isSlotMachine) {
          const slotConfigs = await fetchSlotConfigs();
          const matchingConfig = slotConfigs.find(c => c.id === gameId);
          
          if (matchingConfig) {
            console.log('Found slot config:', matchingConfig);
            setConfig(matchingConfig);
          } else {
            console.warn(`No slot config found for ID: ${gameId}`);
            setError('Configuration not found');
          }
        } else {
          const gameConfigs = await fetchGameConfigs();
          const matchingConfig = gameConfigs.find(c => c.id === gameId);
          
          if (matchingConfig) {
            console.log('Found game config:', matchingConfig);
            setConfig(matchingConfig);
          } else {
            console.warn(`No game config found for ID: ${gameId}`);
            setError('Configuration not found');
          }
        }
      } catch (err) {
        console.error('Error loading game config:', err);
        setError('Failed to load configuration');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch initial configuration
    fetchConfig();
    
    // Set up real-time subscription for config changes
    const configTable = isSlotMachine ? 'slot_configs' : 'game_configs';
    const channel = supabase
      .channel('config-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: configTable,
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log('Config updated in real-time:', payload);
          setConfig(payload.new as any);
          toast.success('Game configuration updated');
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, isSlotMachine]);

  // Utility functions to safely work with the configuration
  const isGameEnabled = (): boolean => {
    return config ? (config.enabled ?? true) : true;
  };

  const getMinBet = (): number => {
    return config ? (config.min_bet ?? 1) : 1;
  };

  const getMaxBet = (): number => {
    return config ? (config.max_bet ?? 100) : 100;
  };

  const getPayout = (outcome: string): number => {
    if (!config || !config.payouts) return 0;
    
    const payout = (config.payouts as Record<string, any>)[outcome];
    if (payout === undefined) return 0;
    
    // Ensure we always return a number
    return typeof payout === 'string' ? parseFloat(payout) : Number(payout);
  };

  const calculateExpectedWin = (betAmount: number): number => {
    return betAmount * (config ? ((config.rtp ?? 95) / 100) : 0.95);
  };

  const applyHouseEdge = (randomValue: number): number => {
    if (!config) return randomValue;
    const houseEdge = config.house_edge ?? 5;
    return randomValue * (1 - houseEdge / 100);
  };

  const getRawConfig = () => config;

  return {
    config,
    isLoading,
    error,
    isGameEnabled,
    getMinBet,
    getMaxBet,
    getPayout,
    calculateExpectedWin,
    applyHouseEdge,
    getRawConfig,
  };
};

export default useGameConfig;
