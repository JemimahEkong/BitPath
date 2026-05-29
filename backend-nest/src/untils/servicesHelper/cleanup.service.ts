/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { QueueService } from '../bullProcessor/queue.service';
import { PrismaService } from '../../database/database.service';
import { CacheService } from 'src/cache.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 🧹 MANUAL SESSION CLEANUP - Clean specific sessions
   */
  async cleanupSpecificSessions(sessionIds: string[], reason: 'TERMINATED' | 'EXPIRED' | 'MANUAL' = 'MANUAL'): Promise<{ success: boolean; cleanedCount: number; message: string }> {
    try {
      this.logger.log(`🔧 Starting manual cleanup for ${sessionIds.length} sessions...`);
      
      await this.queueService.manualSessionCleanup(sessionIds, reason);
      
      return {
        success: true,
        cleanedCount: sessionIds.length,
        message: `Cleanup job queued for ${sessionIds.length} sessions with reason: ${reason}`,
      };
    } catch (error) {
      this.logger.error('❌ Manual session cleanup failed:', error);
      return {
        success: false,
        cleanedCount: 0,
        message: `Failed to queue cleanup job: ${error.message}`,
      };
    }
  }

  /**
   * 🧹 CLEANUP USER SESSIONS - Clean all sessions for a specific user
   */
  async cleanupUserSessions(userId: string, reason: 'TERMINATED' | 'EXPIRED' | 'MANUAL' = 'MANUAL'): Promise<{ success: boolean; cleanedCount: number; message: string }> {
    try {
      this.logger.log(`🔧 Starting cleanup for all sessions of user ${userId}...`);
      
      // Find all sessions for the user
      const userSessions = await this.prisma.session.findMany({
        where: { userId },
        select: { id: true },
      });

      if (userSessions.length === 0) {
        return {
          success: true,
          cleanedCount: 0,
          message: `No sessions found for user ${userId}`,
        };
      }

      const sessionIds = userSessions.map(session => session.id);
      await this.queueService.manualSessionCleanup(sessionIds, reason);
      
      return {
        success: true,
        cleanedCount: sessionIds.length,
        message: `Cleanup job queued for ${sessionIds.length} sessions of user ${userId} with reason: ${reason}`,
      };
    } catch (error) {
      this.logger.error('❌ User session cleanup failed:', error);
      return {
        success: false,
        cleanedCount: 0,
        message: `Failed to queue user session cleanup: ${error.message}`,
      };
    }
  }



  /**
   * 🧹 CLEANUP EXPIRED SESSIONS - Clean all expired sessions
   */
  async cleanupExpiredSessions(): Promise<{ success: boolean; cleanedCount: number; message: string }> {
    try {
      this.logger.log('🔧 Starting cleanup for all expired sessions...');
      
      // Find all expired sessions
      const expiredSessions = await this.prisma.session.findMany({
        where: {
          OR: [
            { status: 'EXPIRED' },
            { expiresAt: { lt: new Date() } },
          ],
        },
        select: { id: true },
      });

      if (expiredSessions.length === 0) {
        return {
          success: true,
          cleanedCount: 0,
          message: 'No expired sessions found',
        };
      }

      const sessionIds = expiredSessions.map(session => session.id);
      await this.queueService.manualSessionCleanup(sessionIds, 'EXPIRED');
      
      return {
        success: true,
        cleanedCount: sessionIds.length,
        message: `Cleanup job queued for ${sessionIds.length} expired sessions`,
      };
    } catch (error) {
      this.logger.error('❌ Expired session cleanup failed:', error);
      return {
        success: false,
        cleanedCount: 0,
        message: `Failed to queue expired session cleanup: ${error.message}`,
      };
    }
  }


  /**
   * 📊 GET CLEANUP STATISTICS - Get statistics for cleanup operations
   */
  async getCleanupStatistics(): Promise<{
    sessions: { total: number; active: number; terminated: number; expired: number }
  }> {
    try {
      const [
        totalSessions,
        activeSessions,
        terminatedSessions,
        expiredSessions
      ] = await Promise.all([
        this.prisma.session.count(),
        this.prisma.session.count({ where: { status: 'ACTIVE' } }),
        this.prisma.session.count({ where: { status: 'TERMINATED' } }),
        this.prisma.session.count({ where: { status: 'EXPIRED' } })
      ]);

      return {
        sessions: {
          total: totalSessions,
          active: activeSessions,
          terminated: terminatedSessions,
          expired: expiredSessions,
        }
      };
    } catch (error) {
      this.logger.error('❌ Failed to get cleanup statistics:', error);
      throw error;
    }
  }

  /**
   * 🚀 IMMEDIATE SESSION CLEANUP - Cleanup sessions NOW without queue
   */
  async cleanupSessionsImmediately(): Promise<{ success: boolean; cleanedCount: number; message: string }> {
    try {
      this.logger.log('🚀 Starting immediate session cleanup...');

      const sessionsToCleanup = await this.prisma.session.findMany({
        where: {
          OR: [
            { status: 'TERMINATED' },
            { status: 'EXPIRED' },
            { expiresAt: { lt: new Date() } },
          ],
        },
        select: {
          id: true,
          token: true,
          userId: true,
          status: true,
        },
      });

      if (sessionsToCleanup.length === 0) {
        this.logger.log('✅ No sessions to cleanup');
        return {
          success: true,
          cleanedCount: 0,
          message: 'No sessions to cleanup',
        };
      }

      this.logger.log(`🔍 Found ${sessionsToCleanup.length} sessions to cleanup`);
      let cleanedCount = 0;

      for (const session of sessionsToCleanup) {
        try {
          try {
            await this.cacheService.deleteCacheKey(`session:${session.token}`);
          } catch (redisError) {
            this.logger.warn(`⚠️ Redis failed for session ${session.id}, continuing without cache cleanup:`, redisError);
          }
          
          await this.prisma.session.delete({
            where: { id: session.id },
          });
          cleanedCount++;
          this.logger.log(`🧹 Cleaned session ${session.id} for user ${session.userId} (${session.status})`);
        } catch (error) {
          this.logger.error(`❌ Failed to cleanup session ${session.id}:`, error);
        }
      }

      this.logger.log(`✅ Immediate cleanup completed: ${cleanedCount}/${sessionsToCleanup.length} sessions cleaned`);
      return {
        success: true,
        cleanedCount: cleanedCount,
        message: `Cleaned ${cleanedCount} sessions immediately`,
      };
    } catch (error) {
      this.logger.error('❌ Immediate session cleanup failed:', error);
      return {
        success: false,
        cleanedCount: 0,
        message: `Failed to cleanup sessions: ${error.message}`,
      };
    }
  }
}
