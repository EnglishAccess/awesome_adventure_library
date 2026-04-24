import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // If user accesses /admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for our custom auth cookie
    const token = request.cookies.get('guild_auth')?.value;
    
    let hasGuildAuth = false;
    if (token) {
        const payload = await verifyToken(token);
        if (payload?.admin) {
            hasGuildAuth = true;
        }
    }

    // If no access cookie, redirect to login page immediately
    if (!hasGuildAuth && !request.nextUrl.pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Ensure middleware only matches specific paths
export const config = {
  matcher: ['/admin/:path*'],
};
