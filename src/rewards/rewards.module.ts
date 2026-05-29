import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { LightningService } from './lightning.service';

@Module({
  controllers: [RewardsController],
  providers: [RewardsService, LightningService],
  exports: [RewardsService, LightningService],
})
export class RewardsModule {}
