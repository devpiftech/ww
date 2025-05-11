
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MessageSquare, Users, Send } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const ChatPanel: React.FC = () => {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, activeRoom, setActiveRoom, onlineUsers } = useChatContext();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Define available chat rooms
  const rooms = [
    { id: 'general', name: 'General' },
    { id: 'slots', name: 'Slots' },
    { id: 'sports', name: 'Sports' },
    { id: 'poker', name: 'Poker' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user) {
      sendMessage(message, activeRoom);
      setMessage('');
    }
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-3 border-b">
        <Tabs defaultValue={activeRoom} onValueChange={setActiveRoom} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            {rooms.map(room => (
              <TabsTrigger key={room.id} value={room.id} className="text-xs">
                {room.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <Tabs defaultValue="chat">
          <div className="border-b px-3 py-1">
            <TabsList className="h-8">
              <TabsTrigger value="chat" className="text-xs">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="online" className="text-xs">
                <Users className="h-3.5 w-3.5 mr-1" />
                Online ({Object.keys(onlineUsers).length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chat" className="m-0 h-[calc(100%-40px)]">
            <ScrollArea className="h-[350px] p-3">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div 
                    key={msg.id || index} 
                    className={`flex gap-2 mb-3 ${msg.user_id === user?.id ? 'justify-end' : ''}`}
                  >
                    {msg.user_id !== user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.avatar_url} />
                        <AvatarFallback>{getInitials(msg.username)}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[75%] ${msg.user_id === user?.id ? 'bg-primary/10' : 'bg-muted'} rounded-lg p-2`}>
                      {msg.user_id !== user?.id && (
                        <div className="text-xs font-semibold mb-1">{msg.username}</div>
                      )}
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs text-muted-foreground text-right mt-1">
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                    
                    {msg.user_id === user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.avatar_url} />
                        <AvatarFallback>{getInitials(msg.username)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="online" className="m-0 h-[calc(100%-40px)]">
            <ScrollArea className="h-[350px] p-3">
              <div className="space-y-4">
                {Object.entries(onlineUsers).length > 0 ? (
                  Object.entries(onlineUsers).map(([userId, userData]) => (
                    <div key={userId} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userData.avatar_url} />
                        <AvatarFallback>{getInitials(userData.username)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{userData.username}</div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Online
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-10">
                    No users online
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatPanel;
