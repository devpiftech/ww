
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import UserProfile from '@/components/UserProfile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import TimeRewards from '@/components/TimeRewards';
import ChatPanel from '@/components/chat/ChatPanel';
import TransactionHistory from '@/components/TransactionHistory';
import PurchaseWayneBucks from '@/components/PurchaseWayneBucks';
import { useAuth } from '@/context/AuthContext';
import { Settings, User, History, Calendar, MessageSquare, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserPreferences } from '@/types/database';

const Profile: React.FC = () => {
  const [coins, setCoins] = useState(1000);
  const [username, setUsername] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    darkMode: true,
    notifications: true,
    soundEffects: true,
    preferredCurrency: 'waynebucks',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, balance, preferences')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setUsername(data.username);
          setCoins(data.balance);
          if (data.preferences) {
            // Fix: Handle the case when data.preferences might not be an object
            const prefs = data.preferences as Record<string, any>;
            setPreferences({
              darkMode: prefs.darkMode ?? true,
              notifications: prefs.notifications ?? true,
              soundEffects: prefs.soundEffects ?? true,
              preferredCurrency: prefs.preferredCurrency ?? 'waynebucks'
            });
          }
        }
      };
      
      fetchUserData();
    }
  }, [user]);

  const handleUpdatePreferences = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      // Fix: Convert UserPreferences to a plain object for JSON compatibility
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username,
          preferences: preferences as any // Cast to any to allow it to be stored in Supabase
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">View your stats and customize your experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="purchase">
                <Coins className="h-4 w-4 mr-2" />
                Purchase
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <UserProfile coins={coins} setCoins={setCoins} />
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>User Preferences</CardTitle>
                  <CardDescription>Customize your casino experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">General Settings</h3>
                      <div className="grid gap-4 mt-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-[250px]"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="dark-mode">Dark Mode</Label>
                          <Switch 
                            id="dark-mode"
                            checked={preferences.darkMode}
                            onCheckedChange={(checked) => 
                              setPreferences(prev => ({ ...prev, darkMode: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Notification Settings</h3>
                      <div className="grid gap-4 mt-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notifications">Enable Notifications</Label>
                          <Switch 
                            id="notifications"
                            checked={preferences.notifications}
                            onCheckedChange={(checked) => 
                              setPreferences(prev => ({ ...prev, notifications: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Game Settings</h3>
                      <div className="grid gap-4 mt-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sound">Sound Effects</Label>
                          <Switch 
                            id="sound"
                            checked={preferences.soundEffects}
                            onCheckedChange={(checked) => 
                              setPreferences(prev => ({ ...prev, soundEffects: checked }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="currency">Preferred Currency</Label>
                          <div className="flex gap-2">
                            <Button
                              variant={preferences.preferredCurrency === 'waynebucks' ? 'default' : 'outline'}
                              className={`text-xs h-8 ${preferences.preferredCurrency === 'waynebucks' ? 'bg-casino-gold hover:bg-casino-gold/90' : ''}`}
                              onClick={() => setPreferences(prev => ({ ...prev, preferredCurrency: 'waynebucks' }))}
                            >
                              WayneBucks
                            </Button>
                            <Button
                              variant={preferences.preferredCurrency === 'waynesweeps' ? 'default' : 'outline'}
                              className={`text-xs h-8 ${preferences.preferredCurrency === 'waynesweeps' ? 'bg-casino-purple hover:bg-casino-purple/90' : ''}`}
                              onClick={() => setPreferences(prev => ({ ...prev, preferredCurrency: 'waynesweeps' }))}
                            >
                              WayneSweeps
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handleUpdatePreferences}
                      disabled={isUpdating}
                      className="casino-btn"
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <TransactionHistory />
            </TabsContent>
            
            <TabsContent value="chat">
              <ChatPanel />
            </TabsContent>
            
            <TabsContent value="purchase">
              <PurchaseWayneBucks />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <TimeRewards />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">WayneBucks vs WayneSweeps</CardTitle>
              <CardDescription>Understanding the difference</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTitle>WayneBucks</AlertTitle>
                <AlertDescription>
                  Used for all casino games. You can purchase these with real money or earn them through time-based rewards.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertTitle>WayneSweeps</AlertTitle>
                <AlertDescription>
                  Used for sweepstakes entries and promotional games. These can only be earned through rewards and promotions, never purchased.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
