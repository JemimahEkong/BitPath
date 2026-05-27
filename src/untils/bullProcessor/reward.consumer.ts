/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { REWARD_QUEUE, RewardJobData } from 'src/untils/constants/constant';
import { PrismaService } from 'src/database/database.service';

@Processor(REWARD_QUEUE)
export class RewardConsumer {
  private readonly logger = new Logger(RewardConsumer.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process()
  async processRewardJob(job: Job<RewardJobData>) {
    this.logger.log(`Processing Reward job for user ${job.data.userId} in conversation ${job.data.conversationId}`);
    
    // Placeholder for actual Reward saving logic
    try {
      await this.prisma.reward.create({
        data: {
          userId: job.data.userId,
          conversationId: job.data.conversationId,
          xp: job.data.xpEarned,
          btcReward: job.data.btcReward,
          reason: job.data.reason,
        },
      });
      this.logger.log(`Successfully saved reward for user ${job.data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to save reward for user ${job.data.userId}: ${error.message}`);
      throw error; // Re-throw to indicate job failure
    }
  }
}
