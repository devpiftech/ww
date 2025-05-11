
import { SlotSymbol, SlotMachineState } from '@/types/slots';
import { SlotMachineConfig } from '@/types/admin';

export interface UseSlotMachineProps {
  initialCoins: number;
  symbols: SlotSymbol[];
  reels: number;
  rows: number;
  minBet: number;
  maxBet: number;
  onWin?: (amount: number) => void;
  onSaveBalance?: (balance: number) => void;
  slotType?: string;
  slotConfig?: SlotMachineConfig;
}

export interface UseSlotMachineResult {
  state: SlotMachineState;
  reelData: SlotSymbol[][];
  spin: () => void;
  changeBet: (amount: number) => void;
  slotConfig?: SlotMachineConfig;
}

export interface SpinLogicProps {
  state: SlotMachineState;
  setState: React.Dispatch<React.SetStateAction<SlotMachineState>>;
  symbols: SlotSymbol[];
  reels: number;
  rows: number;
  onWin?: (amount: number) => void;
  slotConfig?: SlotMachineConfig;
  setReelData: React.Dispatch<React.SetStateAction<SlotSymbol[][]>>;
  isMountedRef: React.MutableRefObject<boolean>;
  spinTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  spinInProgressRef: React.MutableRefObject<boolean>;
  trackGameResult: (betAmount: number, winAmount: number) => void;
}

export interface ConfigHandlerProps {
  slotType: string;
  providedConfig?: SlotMachineConfig;
}
