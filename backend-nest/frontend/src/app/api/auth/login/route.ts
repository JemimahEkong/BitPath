/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import api from '../../../../../lib/axios';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 LOGIN API: Processing login request');
    
    const body = await request.json();
    console.log('🔐 LOGIN API: Received data:', { 
      email: body.email
    });
    
    
    // Call backend API to authenticate user
    const response = await api.post('/auth/login', {
      email: body.email,
      password: body.password
    });
    
    console.log('🔐 LOGIN API: Backend response:', response.data);
    
    // Check if backend login was successful
    if (!response.data.success) {
      console.log('🔐 LOGIN API: Backend returned failure - propagating error');
      return NextResponse.json({
        success: false,
        message: response.data.message || 'Login failed',
      });
    }
    
    // Set session cookie with same settings as verify-otp
    const responseData = response.data;
    
    // Create response with session cookie
    const responseWithCookies = NextResponse.json({
      success: true,
      message: 'Login successful!',
      data: responseData.data,
    });
  
    
    // Set session cookie if sessionToken is present (for OAuth login or when verification not needed)
    if (responseData.data?.sessionToken) {
      const sessionToken = responseData.data.sessionToken;
      console.log('🍪 Setting session cookie in login API route');
      
      const maxAge = body.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days if remember me, else 24 hours
      
      responseWithCookies.cookies.set('session', sessionToken, {
        httpOnly: true,
        secure: false, // Allow HTTP in development
        sameSite: 'lax', // More compatible than 'none' for localhost
        maxAge: maxAge,
        path: '/',
        domain: 'localhost', // Explicit domain for localhost
      });
      
      console.log('🍪 Session cookie set successfully in login');
      
      // Set additional cookies if available
      if (responseData.data.refreshToken) {
        const refreshMaxAge = body.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
        responseWithCookies.cookies.set('refreshToken', responseData.data.refreshToken, {
          httpOnly: true,
          secure: false, // Allow HTTP in development
          sameSite: 'lax', // More compatible than 'none' for localhost
          maxAge: refreshMaxAge,
          path: '/',
          domain: 'localhost', // Explicit domain for localhost
        });
      }
      
      return responseWithCookies;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      data: responseData.data,
    });

  } catch (error: any) {
    console.error('🔐 LOGIN API: Error:', error);
    
    // Handle different error types
    if (error.response?.data) {
      // Backend returned an error
      const status = error.response.status;
      const message = error.response.data.message || 'Login failed';
      
      return NextResponse.json(
        { 
          success: false, 
          message: message,
          error: error.response.data
        },
        { status }
      );
    }
    
    // Network or other errors
    return NextResponse.json(
      { 
        success: false, 
        message: 'Network error. Please try again.',
        error: error.message
      },
      { status: 500 }
    );
  }
}
