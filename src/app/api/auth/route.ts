import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pwd = searchParams.get('pwd');

  // Check if the password is correct
  if (pwd === process.env.ADMIN_PASSWORD) {
    // Create a response that redirects directly into the admin panel
    const response = NextResponse.redirect(new URL('/admin/books', request.url));
    
    // Set a secure signed cookie expiring in 30 days
    const token = await signToken({ admin: true });
    response.cookies.set('guild_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  }

  // If wrong password or no password, throw them back to top seamlessly
  return NextResponse.redirect(new URL('/', request.url));
}
