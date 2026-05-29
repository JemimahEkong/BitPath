/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { XP_QUEUE, XpJobData } from 'src/untils/constants/constant';
import { PrismaService } from 'src/database/database.service';

@Processor(XP_QUEUE)
export class XpConsumer {
  private readonly logger = new Logger(XpConsumer.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process()
  async processXpJob(job: Job<XpJobData>) {
    this.logger.log(`Processing XP job for user ${job.data.userId}: ${job.data.xpAmount} XP for ${job.data.reason}`);
    
    // Placeholder for actual XP update logic
    try {
      await this.prisma.user.update({
        where: { id: job.data.userId },
        data: { totalXp: { increment: job.data.xpAmount } },
      });
      this.logger.log(`Successfully updated XP for user ${job.data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to update XP for user ${job.data.userId}: ${error.message}`);
      throw error; // Re-throw to indicate job failure
    }
  }
}
