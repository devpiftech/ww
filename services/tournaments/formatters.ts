
/**
 * Formats time left in tournament in human-readable format
 * @param endTime Tournament end time
 * @returns Formatted time string
 */
export const formatTimeLeft = (endTime: Date): string => {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h left`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  } else {
    return `${minutes}m left`;
  }
};

/**
 * Formats a prize amount in a human-readable way
 * @param amount Prize amount
 * @returns Formatted prize string
 */
export const formatPrize = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M coins`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K coins`;
  } else {
    return `${amount} coins`;
  }
};
