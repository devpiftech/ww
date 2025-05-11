
import { SlotSymbol, SlotMachineState } from '@/types/slots';
import { SlotMachineConfig } from '@/types/admin';

export interface WinResult {
  totalWin: number;
  pattern?: string;
}

export interface BonusFeatureResult {
  newFreeSpins: number;
  newMultiplier: number;
  bonusActive: boolean;
  bonusPrize: number;
}

export interface PatternInfo {
  pattern: string;
  payoutMultiplier: number;
}
