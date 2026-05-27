/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './database/database.module';
import { join } from 'path';
import config from './config';

import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import * as Joi from 'joi';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule, JwtService } from '@nestjs/jwt';
import "dotenv/config";
import { QueueModule } from './untils/bullProcessor/queue.module';
import { ServicesHelperModule } from './untils/servicesHelper/serviceHelper.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessageModule } from './message/message.module';
import { AiModule } from './ai/ai.module';
import { RewardsModule } from './rewards/rewards.module';




@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    JwtModule.register({}),

       ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),

    QueueModule,
 CacheModule.register({
      ttl: 60 * 60,
      isGlobal: true,
      store: redisStore,
      url: process.env.REDIS_PUBLIC_URL,
    }),
    ThrottlerModule.forRoot([{
      ttl: 900000,
      limit: 10,
    }]),
    UsersModule,
    ServicesHelperModule,
    AuthModule,
    CleanupModule,
    ConversationsModule,
    MessageModule,
    AiModule,
    RewardsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
