/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { QueueService } from './queue.service';
import { OldSessionQueueConsumer } from './oldSessionQueue.consumer';
import { XpConsumer } from './xp.consumer';
import { RewardConsumer } from './reward.consumer';
import { CacheService } from '../../cache.service';
import { OLD_SESSION_QUEUE, XP_QUEUE, REWARD_QUEUE } from '../constants/constant';
import { CleanupModule } from '../../cleanup/cleanup.module';

@Module({
  imports: [
    BullModule.forRoot({
      url: process.env.REDIS_PUBLIC_URL,
    }),
    CacheModule.register(),
    BullModule.registerQueue({ name: OLD_SESSION_QUEUE }),
    BullModule.registerQueue({ name: XP_QUEUE }),
    BullModule.registerQueue({ name: REWARD_QUEUE }),
    forwardRef(() => CleanupModule),
  ],
  providers: [
    QueueService,
    CacheService,
    OldSessionQueueConsumer,
    XpConsumer,
    RewardConsumer
  ],
  exports: [QueueService, CacheService],
})
export class QueueModule {}
