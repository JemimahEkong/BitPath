/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { CleanupController } from './cleanup.controller';
import { CleanupService } from '../untils/servicesHelper/cleanup.service';
import { QueueModule } from '../untils/bullProcessor/queue.module';
import { PrismaModule } from '../database/database.module';
import { ServicesHelperModule } from '../untils/servicesHelper/serviceHelper.module';

@Module({
  imports: [
    forwardRef(() => QueueModule),        // Import QueueModule with forwardRef
    PrismaModule,       // Import PrismaModule for PrismaService dependency
    ServicesHelperModule, // Import ServicesHelperModule for CacheService
  ],
  controllers: [CleanupController],
  providers: [CleanupService],
  exports: [CleanupService],
})
export class CleanupModule {}
