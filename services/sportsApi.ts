
import { SportEvent } from "@/types/slots";
import { toast } from "sonner";

// Free sports API endpoints
const API_BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";

// Map API sport IDs to our categories
const SPORT_ID_MAP: Record<string, string> = {
  "soccer": "4328",
  "basketball": "4387",
  "baseball": "4424",
  "football": "4391",
  "hockey": "4380",
  "tennis": "4464"
};

/**
 * Fetches upcoming events from the sports API
 * @returns Promise with array of SportEvent objects
 */
export const fetchRealSportsEvents = async (): Promise<SportEvent[]> => {
  try {
    // Create an array to hold all events
    let allEvents: SportEvent[] = [];
    
    // Get events for each sport category
    for (const [category, sportId] of Object.entries(SPORT_ID_MAP)) {
      // Fetch upcoming events for this sport
      const response = await fetch(`${API_BASE_URL}/eventsnextleague.php?id=${sportId}`);
      
      if (!response.ok) {
        console.error(`Failed to fetch ${category} events:`, response.statusText);
        continue;
      }
      
      const data = await response.json();
      
      // If no events found, continue to next sport
      if (!data.events || !Array.isArray(data.events)) {
        console.log(`No events found for ${category}`);
        continue;
      }
      
      // Map API events to our SportEvent format
      const events = data.events.slice(0, 5).map((event: any) => {
        // Convert API data to our format
        const sportEvent: SportEvent = {
          id: event.idEvent,
          homeTeam: event.strHomeTeam,
          awayTeam: event.strAwayTeam,
          league: event.strLeague,
          startTime: new Date(event.strTimestamp).toISOString(),
          status: 'scheduled',
        };
        
        // Check if the game is live
        const eventTime = new Date(event.strTimestamp);
        const now = new Date();
        
        // If the event has started but is within the last 2 hours, mark it as live
        if (eventTime < now && now.getTime() - eventTime.getTime() < 2 * 60 * 60 * 1000) {
          sportEvent.status = 'live';
          // Generate random scores for live games
          sportEvent.homeScore = Math.floor(Math.random() * 3);
          sportEvent.awayScore = Math.floor(Math.random() * 3);
          
          // For basketball, scores should be higher
          if (category === 'basketball') {
            sportEvent.homeScore = Math.floor(Math.random() * 30) + 60;
            sportEvent.awayScore = Math.floor(Math.random() * 30) + 60;
          }
        }
        
        return sportEvent;
      });
      
      allEvents = [...allEvents, ...events];
    }
    
    return allEvents;
    
  } catch (error) {
    console.error("Error fetching sports events:", error);
    toast.error("Could not load sports data", { 
      description: "Using fallback data instead" 
    });
    // Return an empty array to be handled by the fallback
    return [];
  }
};

/**
 * Generate realistic live scores for events
 * @param events Array of SportEvent objects
 * @returns Updated events with updated scores
 */
export const updateLiveScores = (events: SportEvent[]): SportEvent[] => {
  return events.map(event => {
    if (event.status === 'live') {
      const isBasketball = event.league.includes('NBA') || 
                          event.league.includes('Basketball');
      
      const homeScoreIncrement = isBasketball 
        ? Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0
        : Math.random() > 0.9 ? 1 : 0;
        
      const awayScoreIncrement = isBasketball
        ? Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0
        : Math.random() > 0.9 ? 1 : 0;
      
      return {
        ...event,
        homeScore: (event.homeScore || 0) + homeScoreIncrement,
        awayScore: (event.awayScore || 0) + awayScoreIncrement,
      };
    }
    return event;
  });
};
