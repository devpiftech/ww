
import { GameConfig, SlotMachineConfig } from '@/types/admin';

export interface UseGameConfigProps {
  gameId: string;
  isSlotMachine?: boolean;
}

export interface GameConfigResult {
  config: GameConfig | SlotMachineConfig | null;
  isLoading: boolean;
  error: string | null;
  isGameEnabled: () => boolean;
  getMinBet: () => number;
  getMaxBet: () => number;
  getPayout: (outcome: string) => number;
  calculateExpectedWin: (betAmount: number) => number;
  applyHouseEdge: (randomValue: number) => number;
  getRawConfig: () => GameConfig | SlotMachineConfig | null;
}
