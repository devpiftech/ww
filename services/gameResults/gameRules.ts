
import { GameConfig, SlotMachineConfig } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the RTP (Return to Player) for a game
 * @param game Game name
 * @returns RTP percentage (0-100)
 */
export const getGameRTP = async (game: string): Promise<number> => {
  try {
    // First check if it's a slot game
    if (game.includes('slot')) {
      const { data, error } = await supabase
        .from('slot_configs')
        .select('rtp')
        .eq('id', game)
        .single();
      
      if (!error && data) {
        console.log(`RTP for ${game}: ${data.rtp}%`);
        return data.rtp;
      }
    }
    
    // Then check regular games
    const { data, error } = await supabase
      .from('game_configs')
      .select('rtp')
      .eq('id', game)
      .single();
    
    if (!error && data) {
      console.log(`RTP for ${game}: ${data.rtp}%`);
      return data.rtp;
    }
    
    // Default RTP
    console.log(`No RTP found for ${game}, using default: 95%`);
    return 95;
  } catch (error) {
    console.error('Error fetching game RTP:', error);
    return 95; // Default RTP
  }
};

/**
 * Gets the house edge for a game
 * @param game Game name
 * @returns House edge percentage (0-100)
 */
export const getHouseEdge = async (game: string): Promise<number> => {
  try {
    // First check if it's a slot game
    if (game.includes('slot')) {
      const { data, error } = await supabase
        .from('slot_configs')
        .select('house_edge')
        .eq('id', game)
        .single();
      
      if (!error && data) {
        console.log(`House edge for ${game}: ${data.house_edge}%`);
        return data.house_edge;
      }
    }
    
    // Then check regular games
    const { data, error } = await supabase
      .from('game_configs')
      .select('house_edge')
      .eq('id', game)
      .single();
    
    if (!error && data) {
      console.log(`House edge for ${game}: ${data.house_edge}%`);
      return data.house_edge;
    }
    
    // Default house edge
    console.log(`No house edge found for ${game}, using default: 5%`);
    return 5;
  } catch (error) {
    console.error('Error fetching house edge:', error);
    return 5; // Default house edge
  }
};

/**
 * Gets the game configuration
 * @param game Game name
 * @returns Game configuration
 */
export const getGameConfig = async (game: string): Promise<GameConfig | SlotMachineConfig> => {
  try {
    // First check if it's a slot game
    if (game.includes('slot')) {
      const { data, error } = await supabase
        .from('slot_configs')
        .select('*')
        .eq('id', game)
        .single();
      
      if (!error && data) {
        console.log(`Loaded slot config for ${game}:`, data);
        return data as SlotMachineConfig;
      }
    }
    
    // Then check regular games
    const { data, error } = await supabase
      .from('game_configs')
      .select('*')
      .eq('id', game)
      .single();
    
    if (!error && data) {
      console.log(`Loaded game config for ${game}:`, data);
      return data as GameConfig;
    }
    
    // Default config
    console.log(`No config found for ${game}, using default config`);
    return {
      id: game,
      name: game,
      min_bet: 5,
      max_bet: 1000,
      enabled: true,
      rtp: 95,
      house_edge: 5,
      payouts: {}
    };
  } catch (error) {
    console.error('Error fetching game config:', error);
    // Default config
    return {
      id: game,
      name: game,
      min_bet: 5,
      max_bet: 1000,
      enabled: true,
      rtp: 95,
      house_edge: 5,
      payouts: {}
    };
  }
};

/**
 * Updates the configuration for a game - syncs local UI state with database
 * @param config The configuration to update
 * @returns true if successful, false otherwise
 */
export const updateGameConfig = async (config: GameConfig | SlotMachineConfig): Promise<boolean> => {
  try {
    // Check if it's a slot config (has slot_type)
    if ('slot_type' in config) {
      const { error } = await supabase
        .from('slot_configs')
        .update(config)
        .eq('id', config.id);
      
      if (error) {
        throw error;
      }
      
      console.log(`Updated slot config for ${config.id}`);
      return true;
    } else {
      // Regular game config
      const { error } = await supabase
        .from('game_configs')
        .update(config)
        .eq('id', config.id);
      
      if (error) {
        throw error;
      }
      
      console.log(`Updated game config for ${config.id}`);
      return true;
    }
  } catch (error) {
    console.error('Error updating game config:', error);
    return false;
  }
};
