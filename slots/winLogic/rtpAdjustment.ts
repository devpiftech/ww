
import { SlotMachineConfig } from '@/types/admin';

/**
 * Adjust win amount based on configured RTP
 */
export const getRtpAdjustedWinAmount = (
  winAmount: number, 
  slotConfig?: SlotMachineConfig
): number => {
  if (!slotConfig) {
    console.log("No slot config provided for RTP adjustment");
    return winAmount;
  }
  
  // Get configured RTP (return to player percentage)
  const configuredRTP = slotConfig.rtp || 95;
  
  // Apply house edge mathematically
  // For a 95% RTP, we multiply by 0.95
  // But we need to ensure randomness, so we add variance
  const rtpFactor = configuredRTP / 100;
  
  console.log(`Using RTP factor: ${rtpFactor} from configured RTP: ${configuredRTP}%`);
  
  // Add variance around the RTP
  // This ensures the experience feels random while maintaining the house edge
  const variance = Math.random() * 0.1 - 0.05; // +/- 5%
  const finalRtpFactor = Math.max(0, rtpFactor + variance);
  
  const adjustedWinAmount = Math.round(winAmount * finalRtpFactor);
  console.log(`Original win: ${winAmount}, RTP adjusted win: ${adjustedWinAmount}`);
  
  return adjustedWinAmount;
};
