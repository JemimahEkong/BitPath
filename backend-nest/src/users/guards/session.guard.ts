/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { SessionService } from '../session/session.service';

@Injectable()
export class SessionGuard {
  private readonly logger = new Logger(SessionGuard.name);

  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const sessionToken = this.extractSessionToken(request);

      if (!sessionToken) {
        throw new UnauthorizedException('No session token provided');
      }

      // Validate session
      const session = await this.sessionService.validateSession(sessionToken);
      
      if (!session) {
        this.logger.warn(`Invalid session token used`);
        throw new UnauthorizedException('Invalid or expired session');
      }



      // Get user details
      const user = await this.sessionService.prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          isEmailVerified: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Attach session and user to request
      request.session = session;
      request.user = user;

      return true;
    } catch (error:any) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractSessionToken(request: any): string | null {
    // Extract session token from Authorization header
    const authHeader = request.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Session ')) {
      return authHeader.substring(8); // Remove 'Session ' prefix
    }

    // Alternatively, extract from cookies
    if (request.cookies && request.cookies.session) {
      return request.cookies.session;
    }

    // Try to parse session from Cookie header
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const sessionCookie = cookies.find(c => c.startsWith('session='));
      if (sessionCookie) {
        const token = sessionCookie.substring(8); // Remove 'session=' prefix
        return token;
      }
    }

    return null;
  }
}
