import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { UsersService } from './users/users.service';

export interface OAuthUserDto {
  email: string;
  googleId?: string;
  twitterId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  /**
   * Validate Google OAuth user
   */
  async validateGoogleUser(oauthUser: OAuthUserDto) {
    const { email, googleId } = oauthUser;

    try {
      // Check if user already exists with this Google ID or email
      const user = await this.userService.findUserByEmail(email);

      if (user) {
        // User exists, update Google ID if not set
        if (!user.googleId && googleId) {
          await this.userService.updateUser(user.id, { googleId });
        }

        console.log(`✅ Existing Google user logged in: ${email}`);
        return user;
      } else {
        // Create new user
        const newUser = await this.userService.createOAuthUser({
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
}
