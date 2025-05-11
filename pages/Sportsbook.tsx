
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, Flag, Info } from 'lucide-react';
import { SPORTS_CATEGORIES } from '@/data/sportsbookData';
import { useSportsbook } from '@/hooks/useSportsbook';
import SportsbookHeader from '@/components/sportsbook/SportsbookHeader';
import SportsCategorySelector from '@/components/sportsbook/SportsCategorySelector';
import UpcomingEvents from '@/components/sportsbook/UpcomingEvents';
import LiveEvents from '@/components/sportsbook/LiveEvents';
import MyBets from '@/components/sportsbook/MyBets';
import { SportEvent } from '@/types/slots';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import CurrencyToggle from '@/components/CurrencyToggle';
import { placeBet, calculateOddsWithHouseEdge, CURRENCY_CONFIG } from '@/services/sportsbookService';

const Sportsbook: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    bets,
    setBets,
    balance,
    setBalance,
    betAmount,
    setBetAmount,
    activeCategoryId,
    setActiveCategoryId,
    handleCurrencyChange,
    upcomingEvents,
    liveEvents,
    user,
    currency,
    userPreferences,
  } = useSportsbook();

  const [showFairnessInfo, setShowFairnessInfo] = useState<boolean>(false);

  // Handle placing a bet
  const handlePlaceBet = (event: SportEvent, betType: string, oddsValue: number) => {
    const odds = calculateOddsWithHouseEdge(event.id, currency);
    
    placeBet(
      event,
      odds,
      'moneyline',
      betType,
      betAmount,
      balance,
      setBets,
      setBalance,
      bets,
      user,
      currency
    );
  };

  return (
    <Layout>
      {/* Header with navigation and balance */}
      <SportsbookHeader 
        balance={balance} 
        setBalance={setBalance} 
        onCurrencyChange={handleCurrencyChange}
        currency={currency}
      />
      
      {/* Currency Toggle */}
      <div className="mb-4">
        <CurrencyToggle 
          preferences={{ preferredCurrency: currency }}
          onToggle={handleCurrencyChange}
          className="inline-flex"
        />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setShowFairnessInfo(!showFairnessInfo)}
                className="ml-2 p-1 text-muted-foreground hover:text-foreground"
              >
                <Info size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View fairness and odds information</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Fairness Information Panel */}
      {showFairnessInfo && (
        <Card className="p-4 mb-4 bg-muted/30">
          <h3 className="font-medium mb-2">Current Betting Parameters</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Currency</p>
              <p className="font-medium">{currency === 'waynebucks' ? 'WayneBucks' : 'WayneSweeps'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">House Edge</p>
              <p className="font-medium">{(CURRENCY_CONFIG[currency].HOUSE_EDGE * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Return to Player</p>
              <p className="font-medium">{(CURRENCY_CONFIG[currency].RTP_CAP * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max Payout</p>
              <p className="font-medium">{CURRENCY_CONFIG[currency].MAX_PAYOUT.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {currency === 'waynesweeps' 
              ? 'WayneSweeps are redeemable and have conservative payout limits.' 
              : 'WayneBucks are play-money with higher RTPs for better entertainment value.'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max bet per user: {CURRENCY_CONFIG[currency].MAX_BET_PER_USER.toLocaleString()}
          </p>
        </Card>
      )}
      
      {/* Sports categories */}
      <SportsCategorySelector
        categories={SPORTS_CATEGORIES}
        activeCategoryId={activeCategoryId}
        setActiveCategoryId={setActiveCategoryId}
      />
      
      <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Upcoming</span>
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Live</span>
            <Badge className="ml-1 bg-red-500">{liveEvents.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="mybets" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            <span>My Bets</span>
            <Badge className="ml-1">{bets.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <UpcomingEvents
            events={upcomingEvents}
            activeCategoryId={activeCategoryId}
            onPlaceBet={handlePlaceBet}
            currency={currency}
          />
        </TabsContent>
        
        <TabsContent value="live">
          <LiveEvents
            events={liveEvents}
            onPlaceBet={handlePlaceBet}
            currency={currency}
          />
        </TabsContent>
        
        <TabsContent value="mybets">
          <MyBets
            bets={bets}
            events={[...upcomingEvents, ...liveEvents]}
            setBets={setBets}
            setBalance={setBalance}
            setActiveTab={setActiveTab}
            currency={currency}
          />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Sportsbook;
