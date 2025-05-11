
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface OnlineUser {
  id: string;
  username: string;
  avatar_url?: string;
  current_game?: string;
  last_activity: Date;
}

interface MultiplayerContextType {
  onlineUsers: Record<string, OnlineUser>;
  currentPlayerCount: number;
  joinGame: (gameName: string) => Promise<void>;
  leaveGame: () => Promise<void>;
  playersInGame: (gameName: string) => OnlineUser[];
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};

export const MultiplayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});
  const [currentGame, setCurrentGame] = useState<string | undefined>(undefined);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Set up presence channel for online users
    const channel = supabase.channel('online_players');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const formattedState: Record<string, OnlineUser> = {};
        
        Object.keys(newState).forEach(key => {
          if (newState[key] && newState[key].length > 0) {
            const presenceData = newState[key][0];
            
            // Fix: Add type checking to ensure we have the expected properties
            if (presenceData && 
                typeof presenceData === 'object' &&
                'id' in presenceData &&
                'username' in presenceData &&
                'last_activity' in presenceData) {
              const userData = presenceData as OnlineUser;
              formattedState[key] = userData;
            }
          }
        });
        
        setOnlineUsers(formattedState);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          try {
            // Fetch user profile for presence data
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', user.id)
              .single();

            if (profileData) {
              const presenceData: OnlineUser = {
                id: user.id,
                username: profileData.username,
                avatar_url: profileData.avatar_url,
                last_activity: new Date(),
                current_game: currentGame
              };
              
              await channel.track(presenceData);
            }
          } catch (error) {
            console.error('Error setting up presence:', error);
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentGame]);

  const joinGame = async (gameName: string) => {
    if (!user) return;

    try {
      setCurrentGame(gameName);
      
      // Update the presence data with the new game
      const channel = supabase.channel('online_players');
      await channel.subscribe(); // Make sure we're subscribed before tracking
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileData) {
        const presenceData: OnlineUser = {
          id: user.id,
          username: profileData.username,
          avatar_url: profileData.avatar_url,
          last_activity: new Date(),
          current_game: gameName
        };
        
        await channel.track(presenceData);
      }

      // Log game join to analytics
      console.log(`User ${user.id} joined game ${gameName}`);
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game.');
    }
  };

  const leaveGame = async () => {
    if (!user || !currentGame) return;

    try {
      const prevGame = currentGame;
      setCurrentGame(undefined);
      
      // Update the presence data without a game
      const channel = supabase.channel('online_players');
      await channel.subscribe(); // Make sure we're subscribed before tracking
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileData) {
        const presenceData: OnlineUser = {
          id: user.id,
          username: profileData.username,
          avatar_url: profileData.avatar_url,
          last_activity: new Date(),
          current_game: undefined
        };
        
        await channel.track(presenceData);
      }

      // Log game leave to analytics
      console.log(`User ${user.id} left game ${prevGame}`);
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  };

  const playersInGame = (gameName: string): OnlineUser[] => {
    return Object.values(onlineUsers).filter(user => user.current_game === gameName);
  };

  return (
    <MultiplayerContext.Provider
      value={{
        onlineUsers,
        currentPlayerCount: Object.keys(onlineUsers).length,
        joinGame,
        leaveGame,
        playersInGame
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};
