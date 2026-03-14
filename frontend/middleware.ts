import { NextRequest, NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard'];

// Define role-based routes
const adminRoutes = ['/dashboard/admin'];
const guideRoutes = ['/dashboard/guide'];
const travelerRoutes = ['/dashboard/traveler'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route requires authentication
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtected) {
    // Public routes - allow access
    return NextResponse.next();
  }

  // For protected routes, check for valid JWT token
  // The token is stored in cookies during the session
  // Since we're using httpOnly cookies for refresh tokens and memory/localStorage for access tokens,
  // we'll rely on the AuthContext to handle the auth state on the client side.
  // This middleware acts as a first-line defense; the client-side useAuth hook provides the actual protection.

  // Note: We cannot directly access localStorage or memory from Next.js middleware.
  // The real auth check happens on the client via useAuth() hook redirects.
  // This middleware is a safety net in case someone directly navigates with an expired session.

  // Allow the request to pass to the client - the layout/page will handle redirects via useAuth()
  return NextResponse.next();
}

// Configure which routes the middleware applies to
export const config = {
  matcher: [
    // Protected dashboard routes
    '/dashboard/:path*',
    // Auth routes that should redirect if already logged in
    '/auth/login',
    '/auth/signup',
  ],
};
