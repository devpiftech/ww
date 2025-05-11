
import { supabase } from '@/integrations/supabase/client';
import { GameConfig, SlotMachineConfig } from '@/types/admin';
import { defaultGameConfigs } from './defaultGameConfigs';
import { defaultSlotConfigs } from './defaultSlotConfigs';

// Fetch game configurations from the database or return default mock data
export const fetchGameConfigs = async (): Promise<GameConfig[]> => {
  try {
    // Attempt to get from database first
    const { data, error } = await supabase
      .from('game_configs')
      .select('*');
      
    if (!error && data && data.length > 0) {
      console.log('Fetched game configs from database:', data.length);
      return data as unknown as GameConfig[];
    }
    
    // If no data in DB or error, fall back to mock data
    console.log('No game configs in database, using default configs');
    return defaultGameConfigs;
  } catch (error) {
    console.error('Error fetching game configs:', error);
    return defaultGameConfigs;
  }
};

// Fetch slot machine configurations from the database or return default mock data
export const fetchSlotConfigs = async (): Promise<SlotMachineConfig[]> => {
  try {
    // Attempt to get from database first
    const { data, error } = await supabase
      .from('slot_configs')
      .select('*');
      
    if (!error && data && data.length > 0) {
      console.log('Fetched slot configs from database:', data.length);
      return data as unknown as SlotMachineConfig[];
    }
    
    // If no data in DB or error, fall back to mock data
    console.log('No slot configs in database, using default configs');
    return defaultSlotConfigs;
  } catch (error) {
    console.error('Error fetching slot configs:', error);
    return defaultSlotConfigs;
  }
};

// Update game configuration in database
export const updateGameConfig = async (config: GameConfig): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('game_configs')
      .update(config)
      .eq('id', config.id);
      
    if (error) throw error;
    
    console.log('Updated game config in database:', config.id);
    return true;
  } catch (error) {
    console.error('Error updating game config:', error);
    return false;
  }
};

// Update slot configuration in database
export const updateSlotConfig = async (config: SlotMachineConfig): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('slot_configs')
      .update(config)
      .eq('id', config.id);
      
    if (error) throw error;
    
    console.log('Updated slot config in database:', config.id);
    return true;
  } catch (error) {
    console.error('Error updating slot config:', error);
    return false;
  }
};
