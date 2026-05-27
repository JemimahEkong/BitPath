import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { QueueModule } from '../bullProcessor/queue.module';
import { JwtModule } from '@nestjs/jwt';
import { CacheService } from 'src/cache.service';
import { PrismaService } from 'src/database/database.service';

@Module({
  imports: [
    CacheModule.register({ ttl: 60 * 60 }),
    forwardRef(() => QueueModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [PrismaService, ConfigService, CacheService],
  exports: [CacheService],
})
export class ServicesHelperModule {}
