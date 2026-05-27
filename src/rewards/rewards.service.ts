/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  async getUnclaimedRewards(userId: string) {
    // First: Check for any quizPassed conversations without rewards and create them!
    await this.createMissingRewardsForExistingQuizzes(userId);
    
    return this.prisma.reward.findMany({
      where: { userId, claimed: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMissingRewardsForExistingQuizzes(userId: string) {
    // Find all quizPassed conversations for this user that don't have a reward
    const quizPassedConversations = await this.prisma.conversation.findMany({
      where: { userId, quizPassed: true },
    });

    for (const conversation of quizPassedConversations) {
      const existingReward = await this.prisma.reward.findFirst({
        where: { conversationId: conversation.id, userId },
      });

      if (!existingReward) {
        // Create missing reward for this quiz - only if all answers are correct!
        const allQuizAttempts = await this.prisma.quizAttempt.findMany({
          where: { conversationId: conversation.id },
        });

        const allCorrect = allQuizAttempts.every(q => q.isCorrect === true);
        
        // Only create reward if all answers are correct (quiz truly passed)
        if (allCorrect) {
          const totalXpEarned = allQuizAttempts.reduce((sum, q) => sum + (q.xpEarned || 0), 0);
          const totalSatoshiEarned = allQuizAttempts.reduce((sum, q) => sum + (q.satoshiEarned || 0), 0);

          await this.prisma.reward.create({
            data: {
              userId,
              conversationId: conversation.id,
              xp: totalXpEarned,
              satoshi: totalSatoshiEarned,
              reason: 'Completed quiz perfectly! 🎉',
            },
          });
        }
      }
    }
  }

  async getConversationRewards(conversationId: string, userId: string) {
    return this.prisma.reward.findMany({
      where: { conversationId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async claimReward(rewardId: string, userId: string) {
    const reward = await this.prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    if (reward.userId !== userId) {
      throw new BadRequestException('This reward does not belong to you');
    }

    if (reward.claimed) {
      throw new BadRequestException('Reward already claimed');
    }

    const updatedReward = await this.prisma.reward.update({
      where: { id: rewardId },
      data: { claimed: true, claimedAt: new Date() },
    });

    return updatedReward;
  }

  async claimAllRewards(userId: string) {
    const unclaimedRewards = await this.prisma.reward.findMany({
      where: { userId, claimed: false },
    });

    if (unclaimedRewards.length === 0) {
      return { claimedCount: 0, message: 'No unclaimed rewards' };
    }

    const totalXp = unclaimedRewards.reduce((sum, r) => sum + r.xp, 0);
    const totalSatoshi = unclaimedRewards.reduce((sum, r) => sum + (r.satoshi || 0), 0);

    await this.prisma.reward.updateMany({
      where: { userId, claimed: false },
      data: { claimed: true, claimedAt: new Date() },
    });

    // Update user's totals
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalXp: { increment: totalXp },
        totalSatoshiEarned: { increment: totalSatoshi },
      },
    });

    return {
      claimedCount: unclaimedRewards.length,
      totalXp,
      totalSatoshi,
      message: `Successfully claimed ${unclaimedRewards.length} rewards!`,
    };
  }
}
