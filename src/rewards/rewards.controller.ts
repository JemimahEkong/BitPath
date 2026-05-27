/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { SessionGuard } from '../users/guards/session.guard';

@Controller('rewards')
@UseGuards(SessionGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('unclaimed')
  async getUnclaimedRewards(@Request() req) {
    return this.rewardsService.getUnclaimedRewards(req.user.id);
  }

  @Get('conversation/:conversationId')
  async getConversationRewards(@Param('conversationId') conversationId: string, @Request() req) {
    return this.rewardsService.getConversationRewards(conversationId, req.user.id);
  }

  @Post(':id/claim')
  async claimReward(@Param('id') rewardId: string, @Request() req) {
    return this.rewardsService.claimReward(rewardId, req.user.id);
  }

  @Post('claim-all')
  async claimAllRewards(@Request() req) {
    return this.rewardsService.claimAllRewards(req.user.id);
  }
}
