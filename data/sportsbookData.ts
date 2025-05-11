
import { SportEvent, SportCategory } from "@/types/slots";

// Sports categories data
export const SPORTS_CATEGORIES: SportCategory[] = [
  { id: 'soccer', name: 'Soccer', slug: 'soccer', icon: '⚽️' },
  { id: 'basketball', name: 'Basketball', slug: 'basketball', icon: '🏀' },
  { id: 'baseball', name: 'Baseball', slug: 'baseball', icon: '⚾️' },
  { id: 'football', name: 'Football', slug: 'football', icon: '🏈' },
  { id: 'hockey', name: 'Hockey', slug: 'hockey', icon: '🏒' },
  { id: 'tennis', name: 'Tennis', slug: 'tennis', icon: '🎾' },
];

// Sample upcoming events
export const getSampleEvents = (): SportEvent[] => {
  const now = new Date();
  
  return [
    {
      id: 'event1',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      league: 'Premier League',
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
    },
    {
      id: 'event2',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      league: 'NBA',
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
    },
    {
      id: 'event3',
      homeTeam: 'Yankees',
      awayTeam: 'Red Sox',
      league: 'MLB',
      startTime: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
      status: 'scheduled',
    },
    {
      id: 'event4',
      homeTeam: 'Barcelona',
      awayTeam: 'Real Madrid',
      league: 'La Liga',
      startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
    },
    {
      id: 'event5',
      homeTeam: 'Chiefs',
      awayTeam: 'Eagles',
      league: 'NFL',
      startTime: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
    },
    {
      id: 'event6',
      homeTeam: 'Nadal',
      awayTeam: 'Djokovic',
      league: 'ATP Tennis',
      startTime: new Date(now.getTime() + 10 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
    },
    {
      id: 'live1',
      homeTeam: 'Manchester City',
      awayTeam: 'Liverpool',
      league: 'Premier League',
      startTime: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      status: 'live',
      homeScore: 2,
      awayScore: 1,
    },
    {
      id: 'live2',
      homeTeam: 'Celtics',
      awayTeam: 'Bucks',
      league: 'NBA',
      startTime: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      status: 'live',
      homeScore: 88,
      awayScore: 92,
    },
    {
      id: 'live3',
      homeTeam: 'Maple Leafs',
      awayTeam: 'Bruins',
      league: 'NHL',
      startTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      status: 'live',
      homeScore: 2,
      awayScore: 3,
    },
  ];
};
