/* eslint-disable prettier/prettier */
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import {
  OLD_SESSION_QUEUE,
  OldSessionJobData,
  XP_QUEUE,
  XpJobData,
  REWARD_QUEUE,
  RewardJobData,
} from '../constants/constant';
import { Cron } from '@nestjs/schedule';
import { CleanupService } from '../servicesHelper/cleanup.service';


// Job interfaces are now exported from constants/constant.ts

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(OLD_SESSION_QUEUE)
    private readonly oldSessionQueue: Queue,
    @InjectQueue(XP_QUEUE)
    private readonly xpQueue: Queue,
    @InjectQueue(REWARD_QUEUE)
    private readonly rewardQueue: Queue,
    @Inject(forwardRef(() => CleanupService))
    private readonly cleanupService: CleanupService,
  ) {}


  /**
   * 🧹 AUTOMATIC SESSION CLEANUP - Runs every 4 hours to clean expired/terminated sessions
   */
  @Cron('0 */4 * * *') // Every 4 hours at minute 0
  async sessionCleanup(): Promise<void> {
    this.logger.log('🔐 Starting automatic session cleanup...');
    
    try {
      await this.cleanupService.cleanupSessionsImmediately();
      this.logger.log('✅ Session cleanup completed');
    } catch (error) {
      this.logger.error('❌ Session cleanup failed:', error);
    }
  }

  /**
   * 🧹 MANUAL CLEANUP - Can be triggered manually for immediate cleanup
   */
  async manualSessionCleanup(
    sessionIds: string[],
    reason: 'TERMINATED' | 'EXPIRED' | 'MANUAL' = 'MANUAL',
  ): Promise<void> {
    this.logger.log(
      `🔧 Starting manual session cleanup for ${sessionIds.length} sessions...`,
    );
    
    try {
      const jobData: OldSessionJobData = {
        sessionIds,
        cleanupReason: reason,
        cleanupDate: new Date(),
      };
      
      await this.oldSessionQueue.add('manual-cleanup-sessions', jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        priority: 10, // High priority for manual cleanup
      });
      
      this.logger.log(
        `✅ Manual session cleanup job added for ${sessionIds.length} sessions`,
      );
    } catch (error) {
      this.logger.error('❌ Manual session cleanup failed:', error);
    }
  }

  async addXpJob(jobData: XpJobData): Promise<void> {
    this.logger.log(
      `Adding XP job for user ${jobData.userId}: ${jobData.xpAmount} XP`,
    );
    try {
      await this.xpQueue.add('update-xp', jobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
      this.logger.log(`✅ XP job added for user ${jobData.userId}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to add XP job for user ${jobData.userId}:`,
        error,
      );
    }
  }

  async addRewardJob(jobData: RewardJobData): Promise<void> {
    this.logger.log(
      `Adding Reward job for user ${jobData.userId} in conversation ${jobData.conversationId}`,
    );
    try {
      await this.rewardQueue.add('save-reward', jobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
      this.logger.log(`✅ Reward job added for user ${jobData.userId}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to add Reward job for user ${jobData.userId}:`,
        error,
      );
    }
  }
}