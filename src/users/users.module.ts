import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SessionService } from './session/session.service';
import { CacheService } from 'src/cache.service';
import { PassportOAuthController } from './passport/passport.controller';
import { AuthCheckController } from './check/auth-check.controller';

@Module({
  controllers: [UsersController, PassportOAuthController, AuthCheckController],
  providers: [UsersService, SessionService, CacheService],
})
export class UsersModule {}
