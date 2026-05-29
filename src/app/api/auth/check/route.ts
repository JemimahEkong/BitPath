/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import api from '../../../../../lib/axios';

export async function GET(request: NextRequest) {
  try {
    console.log('Auth check: Calling backend API');
    console.log('Auth check: Frontend request cookies:', request.cookies);
    console.log('Auth check: Frontend request headers cookie:', request.headers.get('cookie'));
    
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session')?.value;
    
    console.log('Auth check: All cookies received:', request.cookies.getAll());
    console.log('Auth check: Cookie header from request:', request.headers.get('cookie'));
    
    if (!sessionCookie) {
      console.log('Auth check: No session cookie found');
      return NextResponse.json({
        success: false,
        message: 'No session found',
      }, { status: 401 });
    }
    
    console.log('Auth check: Found session cookie:', sessionCookie);
    
    // Call backend API with explicit cookie header (like your successful project)
    const response = await api.get('/auth/check', {
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    });
    
    console.log('Auth check: Backend response:', response.data);
    
    return NextResponse.json({
      success: true,
      message: 'Session valid',
      data: response.data.data,
    });

  } catch (error: any) {
    console.error('Auth check error:', error);
    
    // If session is invalid or expired
    if (error.response?.status === 401) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Session expired or invalid' 
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Authentication check failed' },
      { status: 500 }
    );
  }
}
