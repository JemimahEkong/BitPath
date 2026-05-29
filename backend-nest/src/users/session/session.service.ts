/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {  Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { PrismaService } from 'src/database/database.service';
import { CacheService } from 'src/cache.service';



export interface SessionData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface CreateSessionDto {
  userId: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    sessionToken: string;
    user: {
      id: string;
      email: string;
      isEmailVerified: boolean;
    };
  };
  errorCode?: string;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  
  // Session configurations
  private readonly SESSION_TTL = 30 * 24 * 60 * 60; // 30 days (same as OAuth)

  constructor(
    public readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new session for user with device management
   */
  async createSession(createSessionDto: CreateSessionDto): Promise<LoginResponse> {
    const { userId } = createSessionDto;

    try {
      // 1. Get user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      
      // 3. Check if device needs verification (only for new devices when user has existing sessions)
   await this.prisma.session.findMany({
        where: { 
          userId,
          status: 'ACTIVE' 
        },
      });

  

      // 4. Enforce single session policy - terminate existing sessions
      await this.terminateExistingSessions(userId);

      // 5. Create new session with dynamic TTL based on remember me
      const sessionToken = this.generateSecureSessionToken();
      const sessionTTL =  this.SESSION_TTL; // 30 days vs 24 hours
      const expiresAt = new Date(Date.now() + (sessionTTL * 1000));

      const session = await this.prisma.session.create({
        data: {
          userId,
          token: sessionToken,
          status: 'ACTIVE',
          expiresAt,
        },
      });

      // 6. Cache session for fast lookups with dynamic TTL
      await this.cacheService.setCacheKey(
        `session:${sessionToken}`,
        JSON.stringify({
          sessionId: session.id,
          userId: session.userId,
          expiresAt: session.expiresAt,
        }),
        sessionTTL
      );



      this.logger.log(`Session created for user ${userId}`);

      return {
        success: true,
        message: 'Session created successfully',
        data: {
          sessionToken,
          user: {
            id: user.id,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Error creating session: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create session');
    }
  }


  /**
   * Validate session token
   */
  async validateSession(sessionToken: string): Promise<SessionData | null> {
    try {
      // 1. Check cache first
      const cached = await this.cacheService.getCacheKey(`session:${sessionToken}`);
      
      if (cached) {
        const sessionData = JSON.parse(cached);
        
        // Check if session is still valid
        if (Date.now() > new Date(sessionData.expiresAt).getTime()) {
          await this.terminateSession(sessionToken);
          return null;
        }
        
        return sessionData as SessionData;
      }

      // 2. Fallback to database
      const session = await this.prisma.session.findUnique({
        where: { token: sessionToken },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isEmailVerified: true,
            },
          },
        },
      });

      if (!session) {
        return null;
      }

      // 3. Check session status and expiration
      if (session.status !== 'ACTIVE' || Date.now() > session.expiresAt.getTime()) {
        await this.terminateSession(sessionToken);
        return null;
      }
 // 4. Update cache
      const sessionData: SessionData = {
        id: session.id,
        userId: session.userId,
        token: session.token,
        expiresAt: session.expiresAt,
      };

      await this.cacheService.setCacheKey(
        `session:${sessionToken}`,
        JSON.stringify(sessionData),
        this.SESSION_TTL
      );

      return sessionData;
    } catch (error) {
      this.logger.error(`Error validating session: ${error.message}`);
      return null;
    }
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionToken: string): Promise<void> {
    try {
      // Update database
      await this.prisma.session.updateMany({
        where: { token: sessionToken },
        data: {
          status: 'TERMINATED',
          terminatedAt: new Date(),
        },
      });

      // Remove from cache
      await this.cacheService.deleteCacheKey(`session:${sessionToken}`);
      
      this.logger.log(`Session terminated: ${sessionToken}`);
    } catch (error) {
      this.logger.error(`Error terminating session: ${error.message}`);
    }
  }

  /**
   * Terminate all sessions for a user
   */
  async terminateAllUserSessions(userId: string): Promise<void> {
    try {
      // Update all active sessions
      await this.prisma.session.updateMany({
        where: { 
          userId,
          status: 'ACTIVE',
        },
        data: {
          status: 'TERMINATED',
          terminatedAt: new Date(),
        },
      });

      // Note: Cache entries will expire naturally
      this.logger.log(`All sessions terminated for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error terminating all user sessions: ${error.message}`);
    }
  }


  /**
   * Terminate existing sessions for user/device
   */
  private async terminateExistingSessions(userId: string): Promise<void> {
    try {
      // Terminate all active sessions for this user
      await this.prisma.session.updateMany({
        where: { 
          userId,
          status: 'ACTIVE',
        },
        data: {
          status: 'TERMINATED',
          terminatedAt: new Date(),
        },
      });

      this.logger.log(`Existing sessions terminated for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error terminating existing sessions: ${error.message}`);
    }
  }

  /**
   * Generate secure session token
   */
  private generateSecureSessionToken(): string {
    // Generate a cryptographically secure session token
    const timestamp = Date.now().toString(36);
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `${timestamp}_${randomBytes}`;
  }


  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const sessions = await this.prisma.session.findMany({
        where: { 
          userId,
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true
            },
          },
        },
        orderBy: { lastActiveAt: 'desc' },
      });

      return sessions.map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
        expiresAt: session.expiresAt,
      }));
    } catch (error) {
      this.logger.error(`Error getting user sessions: ${error.message}`);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const result = await this.prisma.session.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          status: 'ACTIVE',
        },
        data: {
          status: 'EXPIRED',
          terminatedAt: new Date(),
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired sessions`);
    } catch (error) {
      this.logger.error(`Error cleaning up expired sessions: ${error.message}`);
    }
  }
}
