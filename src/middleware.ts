import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If user accesses /admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for our custom auth cookie
    const hasGuildAuth = request.cookies.get('guild_auth')?.value === 'true';

    // If no access cookie, redirect to top page immediately
    if (!hasGuildAuth) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Ensure middleware only matches specific paths
export const config = {
  matcher: ['/admin/:path*'],
};
