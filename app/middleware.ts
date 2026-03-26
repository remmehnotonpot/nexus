import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
// Note: Role-based route checks (staff vs customer) are handled client-side via useRequireRole hook
// Middleware only handles basic auth gate for performance
const protectedRoutes = [
  '/dashboard',
  '/billing',
  '/shipments',
  '/customer',
  '/ops',
  '/admin',
  '/analytics',
];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const path = request.nextUrl.pathname;
  
  // Check for Supabase auth cookie
  const authCookie = request.cookies.get('sb-access-token');
  const hasSession = !!authCookie;
  
  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Note: Role-based route checks are handled client-side via useRequireRole hook
  // Middleware only handles basic auth gate for performance

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !hasSession) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
