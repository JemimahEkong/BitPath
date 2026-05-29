import { NextRequest, NextResponse } from 'next/server';

console.log('🔥 PROXY FILE LOADED! (Next.js 16)');

export default async function proxy(request: NextRequest) {
  console.log('🚀 PROXY CALLED FOR:', request.nextUrl.pathname);
  
  const pathname = request.nextUrl.pathname;
  
  // Define protected routes with their requirements
  const protectedRoutes = {
    '/dashboard': {
      requiresAuth: true,
      requiresEmailVerified: true,
    }
   
  };
  
  
  
  // Check if current path is an auth route
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    console.log('🔐 AUTH ROUTE:', pathname);
    
    // Check if user already has a valid session
    const sessionCookie = request.cookies.get('session');
    if (sessionCookie?.value) {
      console.log('👤 USER ALREADY AUTHENTICATED - CHECKING SESSION...');
      
      try {
        // Validate session with backend
        const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/check`, {
          method: 'GET',
          headers: {
            'Cookie': `session=${sessionCookie.value}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          if (authData.success && authData.data?.user) {
            const user = authData.data.user;
            console.log('✅ VALID SESSION FOUND - REDIRECT TO DASHBOARD');
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        }
      } catch (error) {
        console.log('❌ ERROR CHECKING SESSION - ALLOW ACCESS TO AUTH ROUTE');
      }
    }
    
    console.log('✅ NO VALID SESSION - ALLOW ACCESS TO AUTH ROUTE');
    return NextResponse.next();
  }
  
  
  // Check if current path is protected
  const routeConfig = Object.entries(protectedRoutes).find(([route]) => 
    pathname.startsWith(route)
  );
  
  if (routeConfig) {
    const [route, config] = routeConfig;
    console.log('🚫 PROTECTED ROUTE:', pathname);
    
    // Check for session cookies
    const sessionCookie = request.cookies.get('session');
    console.log('🍪 Session cookie exists:', !!sessionCookie?.value);
    
    if (!sessionCookie?.value) {
      console.log('🔄 NO SESSION - REDIRECT TO LOGIN');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Validate session with backend
    try {
      console.log('🔍 CALLING BACKEND API...');
      
      // Get session cookie and format it explicitly
      const sessionCookie = request.cookies.get('session')?.value;
      const cookieHeader = sessionCookie ? `session=${sessionCookie}` : '';
      
      console.log('🍪 Proxy sending cookie header:', cookieHeader);
      
      const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/check`, {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      console.log('📡 BACKEND RESPONSE STATUS:', authResponse.status);

      if (!authResponse.ok) {
        console.log('❌ AUTH FAILED:', authResponse.status);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const authData = await authResponse.json();
      console.log('✅ AUTH SUCCESS:', authData.success);
      
      if (!authData.success || !authData.data?.user) {
        console.log('❌ INVALID SESSION DATA');
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      console.log('🎉 ALL CHECKS PASSED - ALLOW ACCESS');
    } catch (error) {
      console.error('🚨 PROXY ERROR:', error);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  console.log('✅ PUBLIC ROUTE - ALLOW ACCESS');
  return NextResponse.next();
}

export const config = {
  matcher: ['/','/dashboard/:path*','/login', '/signup']
};

console.log('🔧 PROXY CONFIG SET! (Next.js 16)');
