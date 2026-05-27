/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response, CookieOptions } from 'express';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // If the response contains a sessionToken, set it as a cookie
        if (data?.data?.sessionToken) {
          const sessionToken = data.data.sessionToken;

          // Set session cookie with proper security settings for cross-origin
          const cookieOptions: CookieOptions = {
            httpOnly: true, // Prevent XSS attacks
            secure: false, // Must be false for localhost cross-origin
            sameSite: 'none', // Required for cross-origin
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/',
          };

          console.log('🍪 Setting session cookie with options:', cookieOptions);
          response.cookie('session', sessionToken, cookieOptions);
          console.log('🍪 Session cookie set successfully');
        }

        return data;
      }),
    );
  }
}
