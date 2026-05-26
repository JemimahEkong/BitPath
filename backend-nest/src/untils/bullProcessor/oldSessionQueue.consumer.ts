/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../database/database.service';
import { CacheService } from '../../cache.service';
import { OLD_SESSION_QUEUE, OldSessionJobData } from '../constants/constant';

@Processor(OLD_SESSION_QUEUE)
export class OldSessionQueueConsumer {
  private readonly logger = new Logger(OldSessionQueueConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 🧹 AUTOMATIC SESSION CLEANUP PROCESSOR
   */
  @Process('cleanup-sessions')
  async handleAutomaticSessionCleanup(job: Job<OldSessionJobData>): Promise<void> {
    this.logger.log('🔐 Starting automatic session cleanup process...');
    
    try {
      const { cleanupReason, cleanupDate } = job.data;
      
      // Find sessions to cleanup based on status
      const sessionsToCleanup = await this.prisma.session.findMany({
        where: {
          OR: [
            { status: 'TERMINATED' },
            { status: 'EXPIRED' },
            { expiresAt: { lt: new Date() } }, // Expired by date
          ],
        },
        select: {
          id: true,
          token: true,
          userId: true,
          status: true,
          expiresAt: true,
        },
      });

      if (sessionsToCleanup.length === 0) {
        this.logger.log('✅ No sessions to cleanup');
        return;
      }

      this.logger.log(`🔍 Found ${sessionsToCleanup.length} sessions to cleanup`);

      // Cleanup each session
      let cleanedCount = 0;
      for (const session of sessionsToCleanup) {
        try {
          // Delete from cache first
          await this.cacheService.deleteCacheKey(`session:${session.token}`);
          
          // Delete from database
          await this.prisma.session.delete({
            where: { id: session.id },
          });

          cleanedCount++;
          this.logger.log(`🧹 Cleaned session ${session.id} for user ${session.userId} (${session.status})`);
        } catch (error) {
          this.logger.error(`❌ Failed to cleanup session ${session.id}:`, error);
        }
      }

      this.logger.log(`✅ Session cleanup completed: ${cleanedCount}/${sessionsToCleanup.length} sessions cleaned`);
      
      // Update job progress
      job.progress(100);
      
    } catch (error) {
      this.logger.error('❌ Automatic session cleanup failed:', error);
      throw error;
    }
  }

  /**
   * 🔧 MANUAL SESSION CLEANUP PROCESSOR
   */
  @Process('manual-cleanup-sessions')
  async handleManualSessionCleanup(job: Job<OldSessionJobData>): Promise<void> {
    this.logger.log(`🔧 Starting manual session cleanup for ${job.data.sessionIds.length} sessions...`);
    
    try {
      const { sessionIds, cleanupReason, cleanupDate } = job.data;
      
      let cleanedCount = 0;
      for (const sessionId of sessionIds) {
        try {
          // Find session first
          const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            select: {
              id: true,
              token: true,
              userId: true,
              status: true,
            },
          });

          if (!session) {
            this.logger.warn(`⚠️ Session ${sessionId} not found, skipping...`);
            continue;
          }

          // Delete from cache
          await this.cacheService.deleteCacheKey(`session:${session.token}`);
          
          // Delete from database
          await this.prisma.session.delete({
            where: { id: sessionId },
          });

          cleanedCount++;
          this.logger.log(`🧹 Manually cleaned session ${sessionId} for user ${session.userId} (${cleanupReason})`);
        } catch (error) {
          this.logger.error(`❌ Failed to manually cleanup session ${sessionId}:`, error);
        }
      }

      this.logger.log(`✅ Manual session cleanup completed: ${cleanedCount}/${sessionIds.length} sessions cleaned`);
      
      // Update job progress
      job.progress(100);
      
    } catch (error) {
      this.logger.error('❌ Manual session cleanup failed:', error);
      throw error;
    }
  }

  /**
   * 🧹 BULK SESSION CLEANUP - For maintenance operations
   */
  @Process('bulk-cleanup-sessions')
  async handleBulkSessionCleanup(job: Job<OldSessionJobData>): Promise<void> {
    this.logger.log('🧹 Starting bulk session cleanup process...');
    
    try {
      const { cleanupReason, cleanupDate } = job.data;
      
      // Clean all sessions older than 30 days (regardless of status)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldSessions = await this.prisma.session.findMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
        },
        select: {
          id: true,
          token: true,
          userId: true,
          status: true,
          createdAt: true,
        },
      });

      if (oldSessions.length === 0) {
        this.logger.log('✅ No old sessions to cleanup');
        return;
      }

      this.logger.log(`🔍 Found ${oldSessions.length} old sessions to cleanup (older than 30 days)`);

      // Cleanup old sessions
      let cleanedCount = 0;
      for (const session of oldSessions) {
        try {
          // Delete from cache
          await this.cacheService.deleteCacheKey(`session:${session.token}`);
          
          // Delete from database
          await this.prisma.session.delete({
            where: { id: session.id },
          });

          cleanedCount++;
          this.logger.log(`🧹 Cleaned old session ${session.id} for user ${session.userId} (created: ${session.createdAt})`);
        } catch (error) {
          this.logger.error(`❌ Failed to cleanup old session ${session.id}:`, error);
        }
      }

      this.logger.log(`✅ Bulk session cleanup completed: ${cleanedCount}/${oldSessions.length} old sessions cleaned`);
      
      // Update job progress
      job.progress(100);
      
    } catch (error) {
      this.logger.error('❌ Bulk session cleanup failed:', error);
      throw error;
    }
  }
}
