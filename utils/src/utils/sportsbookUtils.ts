
import { SportEvent, BetOdds, SportsBet } from "@/types/slots";
import { MarketExposure, OddsAdjustment } from "@/services/types/supabaseTypes";
import { toast } from "sonner";

// House edge configuration - separate for each currency type
export const HOUSE_EDGE = {
  waynebucks: 0.03, // 3% house edge for regular currency (higher RTP)
  waynesweeps: 0.15  // 15% house edge for sweeps currency (lower RTP)
};

// Risk thresholds by currency
export const RISK_THRESHOLD = {
  waynebucks: 0.6, // 60% max exposure per side for regular currency
  waynesweeps: 0.4  // 40% max exposure per side for sweeps currency
};

// RTP caps by currency
export const RTP_CAP = {
  waynebucks: 0.97, // 97% RTP cap for regular currency
  waynesweeps: 0.85  // 85% RTP cap for sweeps currency
};

// Maximum payout limits by currency
export const MAX_PAYOUT = {
  waynebucks: 100000, // Higher payout for entertainment
  waynesweeps: 5000   // Limited payout for redeemable currency
};

// Store market exposure data
let marketExposures: MarketExposure[] = [];

// Calculate fair odds for an event with house edge applied
export const calculateOddsWithHouseEdge = (eventId: string, currencyType: 'waynebucks' | 'waynesweeps' = 'waynebucks'): BetOdds => {
  // Seed a random number generator with the eventId for consistent odds
  // In a real app, these would be based on actual probabilities or external API
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  
  // Use the hash to generate consistent odds for the same event
  const seedValue = hashCode(eventId);
  const randomGenerator = (min: number, max: number) => {
    const x = Math.sin(seedValue) * 10000;
    const rand = x - Math.floor(x);
    return min + rand * (max - min);
  };
  
  // Generate implied probabilities (should sum to 1 for fair odds)
  // For moneyline (winner market)
  let homeWinProb = randomGenerator(0.35, 0.65);
  let awayWinProb = randomGenerator(0.35, 0.65);
  let drawProb = 1 - homeWinProb - awayWinProb;
  
  // Adjust if probabilities don't make sense
  if (drawProb < 0.05) {
    drawProb = 0.05;
    // Redistribute the remaining probability
    const remaining = 1 - drawProb;
    const homeRatio = homeWinProb / (homeWinProb + awayWinProb);
    const awayRatio = awayWinProb / (homeWinProb + awayWinProb);
    homeWinProb = remaining * homeRatio;
    awayWinProb = remaining * awayRatio;
  }
  
  // Convert to fair decimal odds
  let fairHomeOdds = 1 / homeWinProb;
  let fairAwayOdds = 1 / awayWinProb;
  let fairDrawOdds = 1 / drawProb;
  
  // Apply house edge to odds based on currency type
  // Using margin-based approach to distribute house edge
  const margin = 1 + HOUSE_EDGE[currencyType];
  let homeOdds = fairHomeOdds / margin;
  let awayOdds = fairAwayOdds / margin;
  let drawOdds = fairDrawOdds / margin;
  
  // Apply RTP cap if needed
  const effectiveRTP = 1 / ((1/homeOdds + 1/awayOdds + 1/drawOdds) / 3);
  if (effectiveRTP > RTP_CAP[currencyType]) {
    const rtpAdjustment = effectiveRTP / RTP_CAP[currencyType];
    homeOdds /= rtpAdjustment;
    awayOdds /= rtpAdjustment;
    drawOdds /= rtpAdjustment;
  }
  
  // Generate point spread, typically around 0 with some variance
  const spreadPoints = Math.round((randomGenerator(-7, 7)) * 10) / 10;
  
  // Generate total points, based on the sport/league (would vary in real implementation)
  const isSoccer = eventId.includes('event1') || eventId.includes('event4') || eventId.includes('live1');
  const isBasketball = eventId.includes('event2') || eventId.includes('live2');
  
  // Set a realistic total based on the sport
  let baseTotal = 0;
  if (isSoccer) baseTotal = randomGenerator(2, 3.5); // Soccer typically has 2-3 goals
  else if (isBasketball) baseTotal = randomGenerator(200, 230); // NBA games typically have 200+ total points
  else baseTotal = randomGenerator(7, 9); // Other sports
  
  const totalPoints = Math.round(baseTotal * 10) / 10;
  
  // Generate over/under odds with house edge
  const overProb = 0.5; // Equal chance for simplicity
  const underProb = 0.5;
  
  const fairOverOdds = 1 / overProb;
  const fairUnderOdds = 1 / underProb;
  
  const overOdds = fairOverOdds / margin;
  const underOdds = fairUnderOdds / margin;
  
  // Apply risk adjustments based on market exposure
  const exposure = getMarketExposure(eventId, 'moneyline', currencyType);
  if (exposure) {
    const { outcomes, totalBets } = exposure;
    
    // Only adjust if we have some betting activity
    if (totalBets > 0) {
      const homeExposureRatio = (outcomes.home || 0) / totalBets;
      const awayExposureRatio = (outcomes.away || 0) / totalBets;
      const drawExposureRatio = (outcomes.draw || 0) / totalBets;
      
      const threshold = RISK_THRESHOLD[currencyType];
      
      // Adjust odds to balance exposure
      if (homeExposureRatio > threshold) {
        // Too much exposure on home team, reduce odds to make it less attractive
        homeOdds *= 0.9;
        // Increase odds for the opposite side to incentivize balance
        awayOdds *= 1.1;
      }
      
      if (awayExposureRatio > threshold) {
        // Too much exposure on away team
        awayOdds *= 0.9;
        homeOdds *= 1.1;
      }
      
      if (drawExposureRatio > threshold) {
        // Too much exposure on draw
        drawOdds *= 0.9;
        homeOdds *= 1.05;
        awayOdds *= 1.05;
      }
    }
  }
  
  return {
    type: 'moneyline',
    homeOdds,
    awayOdds,
    drawOdds,
    spreadPoints,
    totalPoints,
    overOdds,
    underOdds,
  };
};

// Track market exposure for risk management
export const trackBetExposure = (
  eventId: string, 
  marketType: string,
  selection: string, 
  amount: number,
  currencyType: 'waynebucks' | 'waynesweeps'
) => {
  // Find existing exposure record or create new one
  let exposure = marketExposures.find(e => 
    e.eventId === eventId && 
    e.market === marketType && 
    e.currencyType === currencyType
  );
  
  if (!exposure) {
    exposure = {
      eventId,
      market: marketType,
      outcomes: {},
      totalBets: 0,
      currencyType
    };
    marketExposures.push(exposure);
  }
  
  // Update exposure data
  exposure.outcomes[selection] = (exposure.outcomes[selection] || 0) + amount;
  exposure.totalBets += amount;
  
  // Log current exposure - in a real app, this would be saved to a database
  console.log('Market exposure updated:', exposure);
  
  return exposure;
};

// Get market exposure data
export const getMarketExposure = (
  eventId: string, 
  marketType: string,
  currencyType: 'waynebucks' | 'waynesweeps'
): MarketExposure | undefined => {
  return marketExposures.find(e => 
    e.eventId === eventId && 
    e.market === marketType && 
    e.currencyType === currencyType
  );
};

// Calculate expected value for a bet to ensure the house edge is applied correctly
export const calculateExpectedValue = (bet: number, odds: number): number => {
  // Expected value = (probability of winning × potential profit) - (probability of losing × bet amount)
  // For decimal odds, probability of winning is roughly 1/odds
  const probOfWinning = 1 / odds;
  const potentialProfit = bet * (odds - 1);
  const probOfLosing = 1 - probOfWinning;
  
  return (probOfWinning * potentialProfit) - (probOfLosing * bet);
};

// Place a bet function with currency-specific logic
export const placeBet = (
  event: SportEvent, 
  odds: BetOdds, 
  betType: string, 
  selection: string, 
  betAmount: number,
  balance: number,
  setBets: React.Dispatch<React.SetStateAction<SportsBet[]>>,
  setBalance: React.Dispatch<React.SetStateAction<number>>,
  bets: SportsBet[],
  user: any,
  currencyType: 'waynebucks' | 'waynesweeps' = 'waynebucks'
) => {
  // Check if user has enough balance
  if (balance < betAmount) {
    toast.error('Insufficient balance', {
      description: 'Please deposit more funds to place this bet'
    });
    return;
  }
  
  let selectedOdds = 0;
  let selectionText = '';
  
  // Determine odds based on selection
  switch (selection) {
    case 'home':
      selectedOdds = odds.homeOdds;
      selectionText = `${event.homeTeam} to win`;
      break;
    case 'away':
      selectedOdds = odds.awayOdds;
      selectionText = `${event.awayTeam} to win`;
      break;
    case 'draw':
      selectedOdds = odds.drawOdds || 0;
      selectionText = 'Draw';
      break;
    case 'over':
      selectedOdds = odds.overOdds || 0;
      selectionText = `Over ${odds.totalPoints}`;
      break;
    case 'under':
      selectedOdds = odds.underOdds || 0;
      selectionText = `Under ${odds.totalPoints}`;
      break;
    default:
      toast.error('Invalid selection');
      return;
  }
  
  // Calculate potential payout
  let potentialPayout = Math.round(betAmount * selectedOdds * 100) / 100;
  
  // Apply maximum payout limit based on currency type
  if (potentialPayout > MAX_PAYOUT[currencyType]) {
    // Adjust odds to cap the payout
    selectedOdds = MAX_PAYOUT[currencyType] / betAmount;
    potentialPayout = MAX_PAYOUT[currencyType];
    
    // Inform user if odds were adjusted
    toast.info('Maximum payout applied', {
      description: `Your potential payout was capped at ${MAX_PAYOUT[currencyType]} due to maximum payout limits.`
    });
  }
  
  // Track the bet exposure for risk management
  trackBetExposure(event.id, betType, selection, betAmount, currencyType);
  
  // Calculate expected value (should be negative due to house edge)
  const expectedValue = calculateExpectedValue(betAmount, selectedOdds);
  console.log(`Bet on ${selectionText}: Expected value = ${expectedValue.toFixed(2)}`);
  
  // Create bet object
  const newBet: SportsBet = {
    id: `bet-${Date.now()}`,
    eventId: event.id,
    type: betType as 'moneyline' | 'spread' | 'total' | 'prop',
    pick: selection,
    odds: selectedOdds,
    amount: betAmount,
    potentialPayout,
    status: 'pending',
  };
  
  // Add bet to state
  setBets([...bets, newBet]);
  
  // Deduct bet amount from balance
  setBalance(currentBalance => currentBalance - betAmount);
  
  // Show confirmation
  toast.success('Bet placed successfully!', {
    description: `${selectionText} - Potential win: ${potentialPayout}`
  });
  
  // In real app, would save to database
  if (user) {
    // Update user balance in database would go here
  }
};
