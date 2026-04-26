import { NextResponse } from 'next/server';
import { COOKIE_OPTIONS } from '@/lib/auth/jwt';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });

  response.cookies.set('access_token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set('refresh_token', '', { ...COOKIE_OPTIONS, maxAge: 0 });

  return response;
}
