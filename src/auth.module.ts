import { Module, forwardRef } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';

import { QueueModule } from './untils/bullProcessor/queue.module';
import { UsersModule } from './users/users.module';
import { SessionGuard } from './users/guards/session.guard';
import { PassportOAuthController } from './users/passport/passport.controller';
import { GoogleStrategy } from './users/strategies/google.strategy';
import { ServicesHelperModule } from './untils/servicesHelper/serviceHelper.module';
import { SessionInterceptor } from './users/interceptors/session.interceptor';
import { PrismaService } from './database/database.service';
import { CacheService } from './cache.service';
import { SessionService } from './users/session/session.service';
import { UsersService } from './users/users.service';
import { TwitterOAuthStrategy } from './users/strategies/twitter.strategy';
@Module({
  imports: [
    ServicesHelperModule, // For OtpHelperService
    QueueModule, // For device verification queue
    HttpModule, // For OAuth API calls
    PassportModule.register({ session: false }), // Passport for OAuth
    ThrottlerModule.forRoot([
      {
        ttl: 60, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
    forwardRef(() => UsersModule), // For UserService dependency in AuthService
  ],
  providers: [
    PrismaService,
    ConfigService,
    CacheService,
    SessionService,
    SessionGuard,
    SessionInterceptor,
    AuthService,
    GoogleStrategy,
    TwitterOAuthStrategy,
    UsersService,
  ],
  controllers: [PassportOAuthController],
  exports: [SessionGuard],
})
export class AuthModule {}
