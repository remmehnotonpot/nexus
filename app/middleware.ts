import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(_request: NextRequest) {
  // Auth currently lives in the browser via `@supabase/supabase-js`, which stores
  // the session client-side. Middleware cannot reliably read that session, so any
  // redirect decision here causes false "logged out" loops after a successful sign-in.
  //
  // Route protection is handled by the existing client hooks (`useRequireAuth` and
  // `useRequireRole`) until server-side Supabase auth is added.
  return NextResponse.next();
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
