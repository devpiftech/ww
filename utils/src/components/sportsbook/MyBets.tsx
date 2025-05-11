
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { SportEvent, SportsBet } from '@/types/slots';
import { CURRENCY_CONFIG } from '@/services/sportsbookService';
import { toast } from 'sonner';
import { Trophy, Calendar, Coins } from 'lucide-react';

interface MyBetsProps {
  bets: SportsBet[];
  events: SportEvent[];
  setBets: React.Dispatch<React.SetStateAction<SportsBet[]>>;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  currency: 'waynebucks' | 'waynesweeps';
}

const MyBets: React.FC<MyBetsProps> = ({
  bets,
  events,
  setBets,
  setBalance,
  setActiveTab,
  currency
}) => {
  if (bets.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">You have no active bets.</p>
        <Button className="mt-4" onClick={() => setActiveTab('upcoming')}>
          Place a Bet
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">My Bets</h2>
      {bets.map(bet => {
        const event = events.find(e => e.id === bet.eventId);
        if (!event) return null;
        
        return (
          <Card 
            key={bet.id} 
            className={`overflow-hidden transition-all animate-fade-in ${
              bet.status === 'won' ? 'border-green-500 shadow-lg' : 
              bet.status === 'lost' ? 'border-red-500' : 
              'hover:border-casino-gold'
            }`}
          >
            <div className="p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center">
                    {event.homeTeam} vs {event.awayTeam}
                  </h3>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {event.league} • {format(new Date(event.startTime), 'MMM d, h:mm a')}
                  </div>
                </div>
                <Badge className={`
                  ${bet.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 
                    bet.status === 'won' ? 'bg-green-500 animate-pulse-glow' : 
                    'bg-red-500'}
                `}>
                  {bet.status === 'won' && <Trophy className="h-3 w-3 mr-1" />}
                  {bet.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Your Pick</div>
                  <div className="font-semibold">{bet.pick}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Odds</div>
                  <div className="font-semibold">{bet.odds.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Stake</div>
                  <div className="font-semibold">{bet.amount}</div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Potential Payout</div>
                  <div className="text-xl font-bold text-casino-gold flex items-center">
                    <Coins className="h-4 w-4 mr-1 animate-pulse-glow" />
                    {bet.potentialPayout}
                  </div>
                </div>
                {bet.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Apply house edge to cashout value (lower than theoretical fair value)
                      const theoreticalFairValue = bet.amount * 0.8;
                      const houseEdgeValue = CURRENCY_CONFIG[currency].HOUSE_EDGE;
                      const cashoutValue = Math.round(theoreticalFairValue * (1 - houseEdgeValue / 2) * 100) / 100;
                      
                      // Update bet status
                      setBets(prev => 
                        prev.map(b => 
                          b.id === bet.id ? { ...b, status: 'cashout' } : b
                        )
                      );
                      
                      // Return funds to user balance
                      setBalance(prevBalance => prevBalance + cashoutValue);
                      
                      toast.success(`Bet cashed out for ${cashoutValue} coins`);
                    }}
                    className="transition-all hover:bg-casino-gold/20 hover:scale-105"
                  >
                    Cash Out
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MyBets;
