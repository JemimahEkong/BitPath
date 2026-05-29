export const OLD_SESSION_QUEUE = 'oldSessionQueue';
export const XP_QUEUE = 'xpQueue';
export const REWARD_QUEUE = 'rewardQueue';

// Export job interfaces for cleanup queues
export interface OldSessionJobData {
  sessionIds: string[];
  cleanupReason: 'TERMINATED' | 'EXPIRED' | 'MANUAL';
  cleanupDate: Date;
}

export interface XpJobData {
  userId: string;
  xpAmount: number;
  reason: string;
}

export interface RewardJobData {
  userId: string;
  conversationId: string;
  xpEarned: number;
  btcReward: number;
  reason: string;
}
