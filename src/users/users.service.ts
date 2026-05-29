/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as argon from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto, LoginResponse } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaService } from 'src/database/database.service';
import { CreateSessionDto, SessionService } from './session/session.service';
import { CacheService } from 'src/cache.service';
import { OAuthUserDto } from 'src/auth.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly loginAttempts = new Map<
    string,
    { count: number; resetTime: Date }
  >();
  private readonly signupAttempts = new Map<
    string,
    { count: number; resetTime: Date }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly cacheService: CacheService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      // CRITICAL: Rate limiting check to prevent abuse
      this.checkSignupRateLimit(createUserDto.email); // IP should be passed from controller

      // CRITICAL: Validate input formats
      this.validateEmailFormat(createUserDto.email);
      this.validatePasswordStrength(createUserDto.password);

      // ✅ Check if user already exists
      const userExists = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (userExists && userExists.isEmailVerified === true) {
        throw new ConflictException({
          message: 'User already exists',
          status: false,
          errorCode: 'USER_ALREADY_EXISTS',
        });
      } else if (userExists && userExists.isEmailVerified === false) {
        throw new ForbiddenException(
          'User already exists but email is unverified',
        );
      }

      // ✅ Hash the password securely using argon2
      const passwordHash = await argon.hash(createUserDto.password);

      // ✅ Create the user with enhanced schema fields
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          passwordHash: passwordHash,
          isActive: true,
        },
      });

      return {
        success: true,
        message: `Account created successfully! `,
        data: {
          userId: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      };
    } catch (error) {
      console.error('Error creating user:', error);

      // ✅ Handle known Prisma constraint errors
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException({
            message: 'Email already exists',
            status: false,
            errorCode: 'EMAIL_ALREADY_EXISTS',
          });
        }
      }

      // ✅ Internet/network-related errors
      if (
        error.code === 'ENOTFOUND' || // DNS error
        error.code === 'ECONNREFUSED' || // Connection refused
        error.code === 'ECONNRESET' || // Connection reset
        error.code === 'ETIMEDOUT' || // Timeout
        error.message?.includes('fetch') ||
        error.message?.includes('network')
      ) {
        throw new InternalServerErrorException({
          message:
            'Network error occurred. Please check your internet connection and try again.',
          status: false,
          errorCode: 'NETWORK_ERROR',
        });
      }

      // ✅ Re-throw known exceptions
      if (
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // ✅ Fallback for unknown errors
      throw new InternalServerErrorException({
        message: 'Failed to create user',
        status: false,
        errorCode: 'INTERNAL_SERVER_ERROR',
      });
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          googleId: true,
          twitterId: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      this.logger.error(`❌ Error finding user by email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Update user (for OAuth ID updates)
   */
  async updateUser(userId: string, updateData: Partial<any>) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          googleId: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true,
        },
      });

      this.logger.log(`✅ User updated: ${updatedUser.email}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`❌ Error updating user: ${userId}`, error);
      throw error;
    }
  }
  /**
   * Create OAuth user (without password)
   */
  async createOAuthUser(userData: any) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: userData.email,
          googleId: userData.googleId,
          isEmailVerified: userData.isEmailVerified || true,
          isActive: userData.isActive || true,
        },
        select: {
          id: true,
          email: true,
          googleId: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true,
        },
      });

      this.logger.log(`✅ New user created: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`❌ Error creating user: ${userData.email}`, error);
      throw error;
    }
  }

  /**
   * Validate Google OAuth user
   */
  async validateGoogleUser(oauthUser: OAuthUserDto) {
    const { email, googleId } = oauthUser;

    try {
      // Check if user already exists with this Google ID or email
      const user = await this.findUserByEmail(email);

      if (user) {
        // User exists, update Google ID if not set
        if (!user.googleId && googleId) {
          await this.updateUser(user.id, { googleId });
        }

        console.log(`✅ Existing Google user logged in: ${email}`);
        return user;
      } else {
        // Create new user
        const newUser = await this.createOAuthUser({
          email,
          googleId,
          isEmailVerified: true, // OAuth users are verified
          isActive: true,
        });

        console.log(`✅ New Google user created: ${email}`);
        return newUser;
      }
    } catch (error) {
      console.error('❌ Error validating Google user:', error);
      throw error;
    }
  }

  /**
   * Validate LinkedIn OAuth user
   */
  async validateTwitterUser(oauthUser: OAuthUserDto) {
    const { email, twitterId } = oauthUser;

    try {
      // Check if user already exists with this Twitter ID or email
      const user = await this.findUserByEmail(email);

      if (user) {
        // User exists, update Twitter ID if not set
        if (!user?.twitterId && twitterId) {
          await this.updateUser(user.id, { twitterId });
        }

        console.log(`✅ Existing Twitter user logged in: ${email}`);
        return user;
      } else {
        // Create new user
        await this.createOAuthUser({
          email,
          twitterId,
          isEmailVerified: true, // OAuth users are verified
          isActive: true,
        });

        console.log(`✅ New Twitter user created: ${email}`);
        return user;
      }
    } catch (error) {
      console.error('❌ Error validating Twitter user:', error);
      throw error;
    }
  }

  /**
   * Create session for OAuth user (same as normal login)
   */
  async createOAuthSession(user: any) {
    try {
      // Create session directly without device verification for OAuth users
      // OAuth providers (Google, LinkedIn) have their own built-in verification
      const sessionData = await this.sessionService.createSession({
        userId: user.id,
      });

      console.log(`✅ OAuth session created for user: ${user.email}`);
      return sessionData;
    } catch (error) {
      console.error('❌ Error creating OAuth session:', error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginDto;

      // CRITICAL: Rate limiting check to prevent brute force attacks
      this.checkLoginRateLimit(email);

      // 1. Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // 2. Verify password
      if (!user.passwordHash) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      const isPasswordValid = await argon.verify(user.passwordHash, password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // 3. Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.',
        };
      }

      // 5. Create session with device verification and remember me
      const createSessionDto: CreateSessionDto = {
        userId: user.id,
      };

      const sessionResult =
        await this.sessionService.createSession(createSessionDto);

      return {
        success: true,
        message: 'Login successful!',
        data: {
          user: {
            id: user.id,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
          },
          ...sessionResult.data,
        },
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      return {
        success: false,
        message: 'Login failed. Please try again.',
      };
    }
  }

  // ==================== SECURITY HELPER METHODS ====================

  /**
   * Check login rate limit to prevent brute force attacks
   */
  private checkLoginRateLimit(email: string): void {
    const emailKey = `login_email:${email}`;

    const now = new Date();

    // Check email-based rate limiting (5 attempts per 15 minutes)
    const emailAttempts = this.loginAttempts.get(emailKey);
    if (emailAttempts && now < emailAttempts.resetTime) {
      if (emailAttempts.count >= 5) {
        throw new BadRequestException(
          'Too many login attempts. Please try again later.',
        );
      }
      emailAttempts.count++;
    } else {
      this.loginAttempts.set(emailKey, {
        count: 1,
        resetTime: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes
      });
    }

    // Clean up expired entries
    this.cleanupExpiredRateLimits();
  }

  /**
   * Check signup rate limit to prevent abuse
   */
  private checkSignupRateLimit(email: string): void {
    const emailKey = `signup_email:${email}`;
    const now = new Date();

    // Check email-based rate limiting (3 attempts per hour)
    const emailAttempts = this.signupAttempts.get(emailKey);
    if (emailAttempts && now < emailAttempts.resetTime) {
      if (emailAttempts.count >= 3) {
        throw new BadRequestException(
          'Too many signup attempts. Please try again later.',
        );
      }
      emailAttempts.count++;
    } else {
      this.signupAttempts.set(emailKey, {
        count: 1,
        resetTime: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour
      });
    }

    // Clean up expired entries
    this.cleanupExpiredRateLimits();
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupExpiredRateLimits(): void {
    const now = new Date();

    // Clean login attempts
    for (const [key, data] of this.loginAttempts.entries()) {
      if (now > data.resetTime) {
        this.loginAttempts.delete(key);
      }
    }

    // Clean signup attempts
    for (const [key, data] of this.signupAttempts.entries()) {
      if (now > data.resetTime) {
        this.signupAttempts.delete(key);
      }
    }
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): void {
    if (!password || password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one lowercase letter',
      );
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter',
      );
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one number',
      );
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one special character',
      );
    }
  }

  /**
   * Validate email format with enhanced regex
   */
  private validateEmailFormat(email: string): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Additional checks
    if (email.length > 254) {
      throw new BadRequestException('Email address is too long');
    }

    const [localPart] = email.split('@');
    if (localPart.length > 64) {
      throw new BadRequestException('Email local part is too long');
    }
  }
}
