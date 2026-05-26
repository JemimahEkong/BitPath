/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GoogleAuthGuard } from '../guards/google.guard';

import { UsersService } from '../users.service';
import { TwitterAuthGuard } from '../guards/twitter.guard';

@Controller('auth')
export class PassportOAuthController {
  constructor(private readonly userService: UsersService) {}

  /**
   * Google OAuth Login
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    // This initiates the Google OAuth flow
    // Passport will redirect to Google automatically
  }

  @Get('twitter')
  @UseGuards(TwitterAuthGuard)
  async twitterLogin() {
    // This initiates the Twitter OAuth flow
    // Passport will redirect to Twitter automatically
  }

  /**
   * Google OAuth Callback
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any; // Type assertion for OAuth user
      if (!user) {
        throw new Error('User not found in OAuth callback');
      }

      // Create session for OAuth user (bypass device verification)
      const sessionData = await this.userService.createOAuthSession(user);

      // Set session cookie
      if (sessionData.data?.sessionToken) {
        res.cookie('session', sessionData.data.sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
      }

      // Redirect to frontend with success
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard?oauth=success&provider=google`);
    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?oauth=error&provider=google`);
    }
  }

  /**
   * LinkedIn OIDC OAuth Callback
   */
  @Get('x/callback')
  @UseGuards(TwitterAuthGuard)
  async twitterCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any; // Type assertion for OAuth user
      if (!user) {
        throw new Error('User not found in Twitter callback');
      }

      // Create session for OAuth user (bypass device verification)
      const sessionData = await this.userService.createOAuthSession(user);

      // Set session cookie
      if (sessionData.data?.sessionToken) {
        res.cookie('session', sessionData.data.sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
      }

      // Redirect to frontend with success
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard?oauth=success&provider=twitter`);
    } catch (error) {
      console.error('❌ Twitter OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?oauth=error&provider=twitter`);
    }
  }
  /**
   * Google OAuth Logout
   */
  // @Get('google/logout')
  // async googleLogout(@Req() req: Request, @Res() res: Response) {
  //   try {
  //     // Clear session cookie
  //     res.clearCookie('session', {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === 'production',
  //       sameSite: 'none',
  //     });

  //     // Get redirect parameter from frontend
  //     const frontendUrl =
  //       (req.query.redirect as string) ||
  //       process.env.FRONTEND_URL ||
  //       'http://localhost:3000/login';

  //     // Redirect to Google's logout endpoint, then back to frontend
  //     const googleLogoutUrl = `https://accounts.google.com/logout?continue=${encodeURIComponent(frontendUrl)}`;
  //     res.redirect(googleLogoutUrl);
  //   } catch (error) {
  //     console.error('❌ Google logout error:', error);
  //     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  //     res.redirect(`${frontendUrl}/login`);
  //   }
  // }
}
