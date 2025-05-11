
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Activity, Bot, MessageCircle, Users } from 'lucide-react';

const BotInfoTab: React.FC = () => {
  return (
    <div>
      <Alert className="mb-4">
        <Activity className="h-4 w-4" />
        <AlertTitle>About AI Bot Simulation</AlertTitle>
        <AlertDescription>
          AI bots help create the illusion of an active platform by simulating player activities like chatting in chat channels, joining games, and appearing in game lobbies. This improves the user experience when real player traffic is low.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Bot Activities:</h3>
          </div>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Send messages to chat channels</li>
            <li>Join and leave game lobbies</li>
            <li>Appear as online players</li>
            <li>Participate in quiz challenges</li>
            <li>Join tournaments</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Chat Simulation:</h3>
          </div>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Bots can send greetings and game-related messages</li>
            <li>Messages appear in public chat channels</li>
            <li>Messages frequency is configurable</li>
            <li>Content is family-friendly and contextual</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-lg mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">Recommended Settings:</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          For optimal simulation experience without overwhelming the system:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
          <li>2-10 bots during low traffic periods</li>
          <li>30-60 seconds between chat messages</li>
          <li>1-5 minutes between game joins</li>
          <li>Increase bot count gradually as needed</li>
          <li>Monitor system performance when running with max bots</li>
        </ul>
      </div>
    </div>
  );
};

export default BotInfoTab;
