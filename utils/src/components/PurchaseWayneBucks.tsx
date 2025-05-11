
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Coins, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    paypal?: any;
  }
}

const packages = [
  { id: 'basic', name: 'Basic', amount: 5, waynebucks: 500 },
  { id: 'standard', name: 'Standard', amount: 10, waynebucks: 1100 },
  { id: 'premium', name: 'Premium', amount: 25, waynebucks: 3000 },
  { id: 'elite', name: 'Elite', amount: 50, waynebucks: 6500 },
  { id: 'vip', name: 'VIP', amount: 100, waynebucks: 15000 },
];

const PurchaseWayneBucks: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState(packages[1].id);
  const [customAmount, setCustomAmount] = useState<number | ''>('');
  const [isCustom, setIsCustom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalButtonContainerRef = React.useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  
  const handlePackageSelect = (packageId: string) => {
    if (packageId === 'custom') {
      setIsCustom(true);
      setSelectedPackage('');
    } else {
      setIsCustom(false);
      setSelectedPackage(packageId);
    }
  };
  
  const getSelectedAmount = () => {
    if (isCustom) {
      return customAmount || 0;
    }
    return packages.find(p => p.id === selectedPackage)?.amount || 0;
  };
  
  const getWayneBucksAmount = () => {
    const amount = getSelectedAmount();
    if (isCustom) {
      return Math.floor(Number(amount) * 100);
    }
    return packages.find(p => p.id === selectedPackage)?.waynebucks || 0;
  };
  
  // Load PayPal SDK
  useEffect(() => {
    // Don't load if already loaded
    if (window.paypal || paypalLoaded) {
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=AX1xVKAX8aFhyYm2F5OytAoZJipRpPDpbElXsbe7AuYcRlXO3nIBy66oCkcPwMVld_1DnXGO7lYQQZk0&currency=USD`;
    script.async = true;
    
    script.onload = () => {
      setPaypalLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load PayPal SDK');
      toast.error('PayPal payment system failed to load');
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [paypalLoaded]);
  
  // Initialize PayPal button
  useEffect(() => {
    if (!paypalLoaded || !user || !paypalButtonContainerRef.current || isProcessing) {
      return;
    }
    
    // Clear any existing buttons
    paypalButtonContainerRef.current.innerHTML = '';
    
    const amount = getSelectedAmount();
    if (!amount || amount <= 0) return;
    
    // Render PayPal buttons
    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'pay'
      },
      
      // Create order
      createOrder: async () => {
        setIsProcessing(true);
        
        try {
          const { data, error } = await supabase.functions.invoke('process-payment', {
            body: {
              action: 'create_order',
              user_id: user.id,
              amount: amount
            }
          });
          
          if (error || !data?.order_id) {
            throw new Error(error?.message || 'Failed to create order');
          }
          
          return data.order_id;
        } catch (err: any) {
          toast.error(`Error: ${err.message}`);
          setIsProcessing(false);
          throw err;
        }
      },
      
      // Capture payment
      onApprove: async (data: { orderID: string }) => {
        try {
          toast.info('Processing payment...');
          
          const { data: captureData, error: captureError } = await supabase.functions.invoke('process-payment', {
            body: {
              action: 'capture_payment',
              user_id: user.id,
              order_id: data.orderID
            }
          });
          
          if (captureError) {
            throw new Error(captureError.message);
          }
          
          toast.success(`Successfully purchased ${captureData.waynebucks_credited} WayneBucks!`);
          
          // Reset form
          if (isCustom) {
            setCustomAmount('');
          }
          
        } catch (err: any) {
          toast.error(`Payment failed: ${err.message}`);
        } finally {
          setIsProcessing(false);
        }
      },
      
      onError: (err: any) => {
        console.error('PayPal error:', err);
        toast.error('Payment failed. Please try again later.');
        setIsProcessing(false);
      }
      
    }).render(paypalButtonContainerRef.current);
    
  }, [paypalLoaded, user, isCustom, selectedPackage, customAmount, isProcessing]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-casino-gold" />
          Purchase WayneBucks
        </CardTitle>
        <CardDescription>
          Select a package or enter a custom amount to purchase
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Package</label>
          <Select value={isCustom ? 'custom' : selectedPackage} onValueChange={handlePackageSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a package" />
            </SelectTrigger>
            <SelectContent>
              {packages.map(pkg => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name}: ${pkg.amount} for {pkg.waynebucks} WayneBucks
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {isCustom && (
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">Custom Amount ($)</label>
            <Input
              id="amount"
              type="number"
              value={customAmount}
              min={1}
              step={1}
              onChange={(e) => setCustomAmount(e.target.value ? Number(e.target.value) : '')}
              placeholder="Enter amount in USD"
              className="w-full"
            />
          </div>
        )}
        
        <div className="bg-muted/30 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div className="text-sm">You Pay:</div>
            <div className="font-semibold flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              {getSelectedAmount()}
            </div>
          </div>
          
          <div className="border-t my-2 border-border/30"></div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">You Get:</div>
            <div className="font-semibold text-casino-gold flex items-center">
              <Coins className="h-4 w-4 mr-1" />
              {getWayneBucksAmount()} WayneBucks
            </div>
          </div>
        </div>
        
        {!user && (
          <div className="text-center text-amber-500 p-2 bg-amber-500/10 rounded-md">
            Please log in to purchase WayneBucks
          </div>
        )}
        
        {/* PayPal buttons container */}
        <div ref={paypalButtonContainerRef} className="mt-4"></div>
        
        {(!paypalLoaded && user) && (
          <div className="text-center py-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading payment options...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseWayneBucks;
