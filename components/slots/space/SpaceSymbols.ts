
import { SlotSymbol } from '@/types/slots';

// Space-themed slot symbols
export const SPACE_SYMBOLS: SlotSymbol[] = [
  { id: 'planet1', value: 15, emoji: '🪐' },
  { id: 'planet2', value: 25, emoji: '🌎' },
  { id: 'moon', value: 30, emoji: '🌙' },
  { id: 'star', value: 40, emoji: '⭐' },
  { id: 'comet', value: 50, emoji: '☄️' },
  { id: 'alien', value: 75, emoji: '👽' },
  { id: 'rocket', value: 100, emoji: '🚀' },
  { id: 'galaxy', value: 150, emoji: '🌌', isWild: true },
  { id: 'ufo', value: 0, emoji: '🛸', isScatter: true },
];
