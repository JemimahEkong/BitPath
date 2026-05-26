import { NextRequest, NextResponse } from 'next/server';

// Handle OAuth redirects and callbacks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  
  if (!provider || !['google', 'linkedin'].includes(provider)) {
    return NextResponse.redirect(
      new URL('/login?error=invalid_provider', request.url)
    );
  }

  try {
    // Redirect to backend OAuth endpoint
    const API_URL = process.env.NEXT_PUBLIC_SERVER_LOCAL_URL || 'http://localhost:3001';
    // Use LinkedIn OIDC endpoint for LinkedIn provider
    const backendUrl = provider === 'linkedin' 
      ? `${API_URL}/auth/linkedin-oidc`
      : `${API_URL}/auth/${provider}`;
    
    // For OAuth initiation, just redirect to backend
    if (!searchParams.has('code') && !searchParams.has('oauth')) {
      return NextResponse.redirect(backendUrl);
    }

    // Handle OAuth callback from backend
    const oauthSuccess = searchParams.get('oauth');
    const oauthProvider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error || oauthSuccess === 'error') {
      return NextResponse.redirect(
        new URL(`/login?oauth=error&provider=${oauthProvider}&error=${error}`, request.url)
      );
    }

    if (oauthSuccess === 'success' && oauthProvider) {
      return NextResponse.redirect(
        new URL(`/dashboard?oauth=success&provider=${oauthProvider}`, request.url)
      );
    }

    // Fallback to login
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', request.url)
    );

  } catch (error) {
    console.error('OAuth route error:', error);
    return NextResponse.redirect(
      new URL('/login?error=oauth_server_error', request.url)
    );
  }
}