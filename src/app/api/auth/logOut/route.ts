import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'No session found' },
        { status: 401 }
      );
    }

    // Call backend logout API
    const API_URL = process.env.NEXT_PUBLIC_SERVER_LOCAL_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${sessionCookie.value}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    const result = await response.json();

    // Clear session cookie
    const responseHeaders = new Headers();
    responseHeaders.set(
      'Set-Cookie',
      `session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=None${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    // Handle OAuth logout URLs
    if (result.data?.oauthLogoutUrls) {
      const oauthUrls = result.data.oauthLogoutUrls;
      
      if (oauthUrls.googleLogout) {
        // For Google, redirect to Google logout then back to login
        const googleLogoutUrl = oauthUrls.googleLogout;
        responseHeaders.set('Location', `${googleLogoutUrl}?redirect=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/login')}`);
        return new NextResponse(
          JSON.stringify({ 
            success: true, 
            message: 'Logging out from Google...',
            requiresRedirect: true,
            provider: 'google'
          }),
          { 
            status: 302, 
            headers: responseHeaders 
          }
        );
      }
      
      if (oauthUrls.linkedinLogout) {
        // For LinkedIn, redirect to LinkedIn logout then back to login
        const linkedinLogoutUrl = oauthUrls.linkedinLogout;
        responseHeaders.set('Location', `${linkedinLogoutUrl}?redirect=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/login')}`);
        return new NextResponse(
          JSON.stringify({ 
            success: true, 
            message: 'Logging out from LinkedIn...',
            requiresRedirect: true,
            provider: 'linkedin'
          }),
          { 
            status: 302, 
            headers: responseHeaders 
          }
        );
      }
    }

    // Regular email logout - no redirect needed
    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: 'Logged out successfully',
        requiresRedirect: false
      }),
      { 
        status: 200, 
        headers: responseHeaders 
      }
    );

  } catch (error) {
    console.error('Logout error:', error);
    
    // Clear cookie even if logout fails
    const responseHeaders = new Headers();
    responseHeaders.set(
      'Set-Cookie',
      `session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=None${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Logout failed',
        requiresRedirect: false
      }),
      { 
        status: 500, 
        headers: responseHeaders 
      }
    );
  }
}
