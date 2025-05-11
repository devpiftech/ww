import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Coins, Trophy, User, Dices, LogIn, LogOut, Menu, X, Settings } from "lucide-react";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const displayUsername = profile?.username || user?.email?.split('@')[0] || 'User';
  const coins = profile?.balance || 0;
  
  const collectDailyBonus = async () => {
    if (!user) {
      toast('Please sign in first', {
        description: 'Create an account to collect bonuses and save your progress.',
        action: {
          label: 'Sign In',
          onClick: () => navigate('/auth'),
        },
      });
      return;
    }
    
    try {
      const bonus = Math.floor(Math.random() * 500) + 500;
      
      const { data, error } = await supabase.rpc('update_balance', {
        user_uuid: user.id,
        amount: bonus,
        t_type: 'daily_bonus',
        game_name: null,
        meta: { bonus_amount: bonus }
      });
      
      if (error) throw error;
      
      // Update profile balance locally
      if (profile) {
        updateProfile({ balance: profile.balance + bonus });
      }
      
      toast.success(`Daily Bonus Collected: +${bonus} coins!`, {
        description: "Come back tomorrow for another bonus!"
      });
    } catch (error) {
      console.error('Error collecting bonus:', error);
      toast.error('Failed to collect bonus. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Games", path: "/games" },
    { name: "Slots", path: "/slots" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Admin", path: "/admin" }, // Added Admin link
  ];
  
  return (
    <header className="bg-card/70 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative neon-glow">
              <div className="relative z-10 bg-gradient-to-r from-casino-purple to-casino-red bg-clip-text text-transparent text-3xl font-bold">
                WayneWagers
              </div>
            </div>
          </Link>
          
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-lg font-semibold transition-colors hover:text-casino-gold",
                  location.pathname === item.path ? "text-casino-gold" : "text-white"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center gap-3">
            <div className="bg-muted/30 rounded-full py-1 px-3 flex items-center gap-1">
              <Coins className="h-4 w-4 text-casino-gold animate-pulse-glow" />
              <span className="text-casino-gold font-semibold">{coins}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="border-casino-gold/50 hover:border-casino-gold text-casino-gold hover:bg-casino-gold/10"
              onClick={collectDailyBonus}
            >
              Daily Bonus
            </Button>
            
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="rounded-full bg-muted/20 hover:bg-muted/40">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="text-sm text-muted-foreground hidden md:block">
                  {displayUsername}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSignOut} 
                  className="rounded-full bg-muted/20 hover:bg-muted/40"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 bg-muted/20 hover:bg-muted/40"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-border/40 py-4">
          <div className="container mx-auto flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-lg font-semibold transition-colors hover:text-casino-gold py-2",
                  location.pathname === item.path ? "text-casino-gold" : "text-white"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="flex items-center gap-3 py-2">
              <div className="bg-muted/30 rounded-full py-1 px-3 flex items-center gap-1">
                <Coins className="h-4 w-4 text-casino-gold" />
                <span className="text-casino-gold font-semibold">{coins}</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="border-casino-gold/50 hover:border-casino-gold text-casino-gold hover:bg-casino-gold/10"
                onClick={() => {
                  collectDailyBonus();
                  setMobileMenuOpen(false);
                }}
              >
                Daily Bonus
              </Button>
            </div>
            
            <div className="flex items-center gap-3 py-2">
              {user ? (
                <>
                  <div className="text-sm text-white">
                    {displayUsername}
                  </div>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="flex items-center gap-2 bg-muted/20 hover:bg-muted/40">
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 bg-muted/20 hover:bg-muted/40"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 bg-muted/20 hover:bg-muted/40"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
