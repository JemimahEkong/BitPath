/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: process.env.BITPATH_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.BITPATH_GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.BITPATH_GOOGLE_CALLBACK || '',
      scope: ['email', 'profile', 'openid'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      console.log('🔍 Google OAuth Profile:', profile);

      const user = await this.usersService.validateGoogleUser({
        email: profile.emails[0].value,
        googleId: profile.id,
      });

      // If user exists, create session directly
      // If user doesn't exist, create user then create session
      return done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth validation error:', error);
      return done(error);
    }
  }
}
