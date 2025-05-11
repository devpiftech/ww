import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Star, Coins } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface UserProfileProps {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

const UserProfile: React.FC<UserProfileProps> = ({ coins, setCoins }) => {
  const { user, profile, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [level, setLevel] = useState(5);
  const [xp, setXp] = useState(750);
  
  // Initialize username from profile when component loads
  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile]);
  
  const achievements: Achievement[] = [
    {
      id: "first-win",
      name: "First Win",
      description: "Win your first game",
      icon: <Trophy className="h-5 w-5" />,
      unlocked: true
    },
    {
      id: "big-spender",
      name: "Big Spender",
      description: "Place a bet of 100 coins or more",
      icon: <Coins className="h-5 w-5" />,
      unlocked: true
    },
    {
      id: "jackpot",
      name: "Jackpot Winner",
      description: "Win the jackpot in any game",
      icon: <Award className="h-5 w-5" />,
      unlocked: false
    },
    {
      id: "loyal",
      name: "Loyal Player",
      description: "Log in for 7 days in a row",
      icon: <Star className="h-5 w-5" />,
      unlocked: false
    }
  ];
  
  const addCoins = async () => {
    // In a real app, this would be a purchase flow
    if (!user) return;
    
    const amount = 5000;
    
    try {
      // Update balance in Supabase
      const { data, error } = await supabase.rpc('update_balance', {
        user_uuid: user.id,
        amount: amount,
        t_type: 'purchase',
        game_name: null,
        meta: { source: 'user_profile' }
      });
      
      if (error) throw error;
      
      // Update local state
      setCoins(prev => prev + amount);
      
      // Update profile state in AuthContext
      if (profile) {
        updateProfile({ balance: profile.balance + amount });
      }
      
      toast.success(`${amount} coins added to your account!`, {
        description: "Thank you for your purchase."
      });
    } catch (error) {
      console.error('Error adding coins:', error);
      toast.error('Failed to add coins. Please try again.');
    }
  };
  
  const generateRandomAvatar = () => {
    const styles = ["adventurer", "adventurer-neutral", "avataaars", "big-ears", "big-smile"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const seed = Math.random().toString(36).substring(7);
    return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;
  };

  const handleUsernameUpdate = async () => {
    if (!user || !username.trim()) return;
    
    try {
      await updateProfile({ username: username.trim() });
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-card border-border/30 shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">My Profile</CardTitle>
              <CardDescription>Manage your account and view progress</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-muted/30 rounded-full py-1 px-3 flex items-center gap-1">
                <Coins className="h-4 w-4 text-casino-gold" />
                <span className="text-casino-gold font-semibold">{coins}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-casino-gold/50 hover:border-casino-gold text-casino-gold hover:bg-casino-gold/10"
                onClick={addCoins}
              >
                Add Coins
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4 border-4 border-casino-purple/50">
                <AvatarImage src={profile?.avatar_url || generateRandomAvatar()} alt={username} />
                <AvatarFallback className="bg-muted">{username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <h3 className="text-xl font-bold">{username}</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={handleUsernameUpdate}
                    title="Save username"
                  >
                    <i className="text-xs">✓</i>
                  </Button>
                </div>
                <div className="flex items-center gap-2 justify-center mt-1">
                  <Badge className="bg-casino-purple">Level {level}</Badge>
                  <span className="text-sm text-muted-foreground">{xp} XP</span>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="px-2 py-1 text-sm border rounded bg-muted/20 text-center w-40"
                    placeholder="Set username"
                    onBlur={handleUsernameUpdate}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUsernameUpdate();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <Tabs defaultValue="achievements">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="stats">Game Stats</TabsTrigger>
                </TabsList>
                
                <TabsContent value="achievements">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id}
                        className={`p-4 rounded-lg border ${achievement.unlocked ? 'bg-muted/20 border-casino-gold/30' : 'bg-muted/10 border-border/30'}`}
                      >
                        <div className="flex gap-3 items-center">
                          <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-casino-gold/20 text-casino-gold' : 'bg-muted/20 text-muted-foreground'}`}>
                            {achievement.icon}
                          </div>
                          <div>
                            <h4 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-muted-foreground'}`}>
                              {achievement.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="stats">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="casino-card p-4">
                      <h4 className="font-semibold text-muted-foreground mb-1">Games Played</h4>
                      <p className="text-2xl font-bold">42</p>
                    </div>
                    
                    <div className="casino-card p-4">
                      <h4 className="font-semibold text-muted-foreground mb-1">Total Winnings</h4>
                      <p className="text-2xl font-bold text-casino-gold">12,500</p>
                    </div>
                    
                    <div className="casino-card p-4">
                      <h4 className="font-semibold text-muted-foreground mb-1">Biggest Win</h4>
                      <p className="text-2xl font-bold text-casino-red">2,750</p>
                    </div>
                    
                    <div className="casino-card p-4">
                      <h4 className="font-semibold text-muted-foreground mb-1">Win Rate</h4>
                      <p className="text-2xl font-bold">36%</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
