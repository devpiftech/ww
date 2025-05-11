
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { ChatMessage } from '@/types/database';

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string, room: string) => Promise<void>;
  activeRoom: string;
  setActiveRoom: (room: string) => void;
  onlineUsers: Record<string, { username: string; avatar_url?: string }>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeRoom, setActiveRoom] = useState<string>('general');
  const [onlineUsers, setOnlineUsers] = useState<Record<string, { username: string; avatar_url?: string }>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Load initial messages
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room', activeRoom)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        if (data) {
          setMessages(data.reverse() as ChatMessage[]);
        }
      } catch (error) {
        console.error('Error in fetchMessages:', error);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room=eq.${activeRoom}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    // Set up presence channel for online users
    const presenceChannel = supabase.channel('online_users');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const formattedState: Record<string, { username: string; avatar_url?: string }> = {};
        
        Object.keys(newState).forEach(key => {
          if (newState[key] && newState[key].length > 0) {
            // Fix: Ensure we're properly handling the presence data structure
            // The previous code assumed the presence data had username and avatar_url directly,
            // but the actual structure might be different
            const presenceData = newState[key][0];
            
            // Make sure we have the right properties before adding to formatted state
            if (presenceData && typeof presenceData === 'object' && 'username' in presenceData) {
              const userData = presenceData as { username: string; avatar_url?: string };
              formattedState[key] = {
                username: userData.username,
                avatar_url: userData.avatar_url
              };
            }
          }
        });
        
        setOnlineUsers(formattedState);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          // Fetch user profile for presence data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

          if (profileData) {
            const presenceData = {
              username: profileData.username,
              avatar_url: profileData.avatar_url,
            };
            
            await presenceChannel.track(presenceData);
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [user, activeRoom]);

  const sendMessage = async (content: string, room: string) => {
    if (!user || !content.trim()) return;

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError) {
        toast.error('Error sending message');
        return;
      }

      const newMessage = {
        user_id: user.id,
        username: profileData.username,
        avatar_url: profileData.avatar_url,
        content: content.trim(),
        room,
      };

      const { error } = await supabase.from('chat_messages').insert(newMessage);

      if (error) {
        toast.error('Error sending message');
        console.error('Error sending message:', error);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        activeRoom,
        setActiveRoom,
        onlineUsers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
