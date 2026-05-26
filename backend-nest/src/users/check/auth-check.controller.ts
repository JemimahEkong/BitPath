/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { 
  Controller, 
  Get, 
  Req, 
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { SessionGuard } from '../guards/session.guard';
import { PrismaService } from '../../database/database.service';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(SessionGuard)
@ApiBearerAuth()
export class AuthCheckController {
  private readonly logger = new Logger(AuthCheckController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if user session is valid
   */
  @Get('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Check authentication status',
    description: 'Verify if the current session is valid and return user information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Session is valid',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                fullName: { type: 'string' },
                isEmailVerified: { type: 'boolean' },
                onboardingCompleted: { type: 'boolean' },
                businessConfigCompleted: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired session' })
  async checkAuth(@Req() request: any) {
    const user = request.user;

    this.logger.log(`Auth check requested for user: ${user?.id || 'unknown'}`);

    if (!user) {
      throw new UnauthorizedException('User not found in session');
    }

    // Fetch fresh data from database to get latest businessConfigCompleted status and organization
    const freshUserData = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
      },
    });




    return {
      success: true,
      message: 'Session is valid',
      data: {
        user: {
          id: freshUserData?.id,
          email: freshUserData?.email,
          isEmailVerified: freshUserData?.isEmailVerified
        }
      }
    };
  }

}
