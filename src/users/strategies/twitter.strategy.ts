/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-google-oauth20';
import { UsersService } from '../users.service';

@Injectable()
export class TwitterOAuthStrategy extends PassportStrategy(
  Strategy,
  'twitter',
) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: process.env.BITPATH_TWITTER_CLIENT_ID || '',
      clientSecret: process.env.BITPATH_TWITTER_SECRET || '',
      callbackURL:
        process.env.BITPATH_TWITTER_CALLBACK ||
        'http://localhost:3001/auth/x/callback',
      scope: ['tweet.read', 'users.read', 'offline.access'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    try {
      console.log('🔍 X OAuth Profile:', profile);

      // X does NOT have a universal OIDC userinfo endpoint like LinkedIn
      // so profile usually comes from passport strategy OR manual fetch

      const oauthUser = {
        email: profile?.emails?.[0]?.value || null,
        twitterId: profile?.id,
      };

      const user = await this.usersService.validateTwitterUser(oauthUser);

      console.log(`✅ X user validated: ${user?.email || user?.twitterId}`);
      done(null, user);
    } catch (error) {
      console.error('❌ X OAuth validation error:', error);
      done(error, null);
    }
  }
}
