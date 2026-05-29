/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CleanupService } from '../untils/servicesHelper/cleanup.service';

@ApiTags('Cleanup')
@Controller('cleanup')
export class CleanupController {
  constructor(private readonly cleanupService: CleanupService) {}

  /**
   * 🧹 Manual Session Cleanup
   */
  @Post('sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually cleanup specific sessions' })
  @ApiResponse({ status: 200, description: 'Session cleanup job queued successfully' })
  @ApiResponse({ status: 400, description: 'Failed to queue cleanup job' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of session IDs to cleanup',
        },
        reason: {
          type: 'string',
          enum: ['TERMINATED', 'EXPIRED', 'MANUAL'],
          description: 'Reason for cleanup',
          default: 'MANUAL',
        },
      },
      required: ['sessionIds'],
    },
  })
  async cleanupSessions(
    @Body() body: { sessionIds: string[]; reason?: 'TERMINATED' | 'EXPIRED' | 'MANUAL' },
  ) {
    return await this.cleanupService.cleanupSpecificSessions(
      body.sessionIds,
      body.reason || 'MANUAL',
    );
  }

  
  /**
   * 🧹 Cleanup User Sessions
   */
  @Post('users/:userId/sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cleanup all sessions for a specific user' })
  @ApiResponse({ status: 200, description: 'User session cleanup job queued successfully' })
  @ApiResponse({ status: 400, description: 'Failed to queue cleanup job' })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID' })
  @ApiQuery({ 
    name: 'reason', 
    required: false, 
    enum: ['TERMINATED', 'EXPIRED', 'MANUAL'],
    description: 'Reason for cleanup',
    example: 'MANUAL' 
  })
  async cleanupUserSessions(
    @Query('userId') userId: string,
    @Query('reason') reason?: 'TERMINATED' | 'EXPIRED' | 'MANUAL',
  ) {
    return await this.cleanupService.cleanupUserSessions(userId, reason || 'MANUAL');
  }

  

  /**
   * 🧹 Cleanup All Expired Sessions
   */
  @Post('sessions/expired')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cleanup all expired sessions' })
  @ApiResponse({ status: 200, description: 'Expired session cleanup job queued successfully' })
  @ApiResponse({ status: 400, description: 'Failed to queue cleanup job' })
  async cleanupExpiredSessions() {
    return await this.cleanupService.cleanupExpiredSessions();
  }

 

  /**
   * 📊 Get Cleanup Statistics
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get cleanup statistics for sessions and devices' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cleanup statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sessions: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            active: { type: 'number' },
            terminated: { type: 'number' },
            expired: { type: 'number' },
          },
        },
        devices: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            active: { type: 'number' },
            pending: { type: 'number' },
            revoked: { type: 'number' },
            expired: { type: 'number' },
          },
        },
      },
    },
  })
  async getCleanupStatistics() {
    return await this.cleanupService.getCleanupStatistics();
  }

  /**
   * 🚀 Immediate Session Cleanup
   */
  @Post('sessions/immediate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Immediate cleanup of all terminated/expired sessions' })
  @ApiResponse({ status: 200, description: 'Sessions cleaned up immediately' })
  async cleanupSessionsImmediately() {
    return await this.cleanupService.cleanupSessionsImmediately();
  }
}
