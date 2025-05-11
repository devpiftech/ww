
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Coins } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserPreferences } from '@/types/database';

interface CurrencySelectorProps {
  className?: string;
  onCurrencyChange?: (currency: 'waynebucks' | 'waynesweeps') => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ className = '', onCurrencyChange }) => {
  const { user } = useAuth();
  const [isWayneSweeps, setIsWayneSweeps] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [pendingPreference, setPendingPreference] = useState<'waynebucks' | 'waynesweeps'>('waynebucks');
  
  React.useEffect(() => {
    // Load user preference if logged in
    const loadPreference = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();
            
          if (data && data.preferences) {
            // Fix: Properly handle the JSON data from Supabase
            const preferences = data.preferences as any;
            
            // Make sure we have a preferredCurrency property
            if (preferences && 
                typeof preferences === 'object' && 
                'preferredCurrency' in preferences) {
              const currentPreference = preferences.preferredCurrency;
              setIsWayneSweeps(currentPreference === 'waynesweeps');
            }
          }
        } catch (error) {
          console.error('Error loading currency preference:', error);
        }
      }
    };
    
    loadPreference();
  }, [user]);

  const handleToggle = () => {
    const newPreference = !isWayneSweeps ? 'waynesweeps' : 'waynebucks';
    setPendingPreference(newPreference);
    setShowConfirm(true);
  };

  const confirmSwitch = async () => {
    setIsWayneSweeps(pendingPreference === 'waynesweeps');
    
    // Save user preference if logged in
    if (user) {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();
        
        // Handle the JSON data from Supabase
        let currentPreferences: UserPreferences;
        
        if (profileData?.preferences && typeof profileData.preferences === 'object') {
          // Try to parse existing preferences
          const prefs = profileData.preferences as any;
          
          currentPreferences = {
            darkMode: prefs.darkMode ?? true,
            notifications: prefs.notifications ?? true,
            soundEffects: prefs.soundEffects ?? true,
            preferredCurrency: prefs.preferredCurrency ?? 'waynebucks'
          };
        } else {
          // Default preferences if none exist
          currentPreferences = {
            darkMode: true,
            notifications: true,
            soundEffects: true,
            preferredCurrency: 'waynebucks'
          };
        }
        
        // Update preferences
        const updatedPreferences = {
          ...currentPreferences,
          preferredCurrency: pendingPreference
        };
        
        await supabase
          .from('profiles')
          .update({ preferences: updatedPreferences })
          .eq('id', user.id);
          
        toast.success(`Currency switched to ${pendingPreference === 'waynebucks' ? 'WayneBucks' : 'WayneSweeps'}`, {
          description: pendingPreference === 'waynebucks' 
            ? 'You are now playing with WayneBucks' 
            : 'You are now playing with WayneSweeps (sweepstakes currency)'
        });
      } catch (error) {
        console.error('Error saving currency preference:', error);
      }
    } else {
      // For non-logged in users, just show a toast
      toast.success(`Currency switched to ${pendingPreference === 'waynebucks' ? 'WayneBucks' : 'WayneSweeps'}`, {
        description: pendingPreference === 'waynebucks' 
          ? 'You are now playing with WayneBucks' 
          : 'You are now playing with WayneSweeps (sweepstakes currency)'
      });
    }
    
    // Notify parent component if callback provided
    if (onCurrencyChange) {
      onCurrencyChange(pendingPreference);
    }
    
    setShowConfirm(false);
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-casino-gold" />
          <span className="text-sm font-medium">WayneBucks</span>
        </div>
        
        <Switch
          checked={isWayneSweeps}
          onCheckedChange={handleToggle}
        />
        
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-casino-purple" />
          <span className="text-sm font-medium">WayneSweeps</span>
        </div>
      </div>
      
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Currency?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to switch to {pendingPreference === 'waynebucks' ? 'WayneBucks' : 'WayneSweeps'}?
              {pendingPreference === 'waynesweeps' && (
                <div className="mt-2 text-sm bg-muted p-2 rounded">
                  <strong>Note:</strong> WayneSweeps are sweepstakes coins that can be redeemed for prizes.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSwitch}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CurrencySelector;
