import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import type { JwtPayload } from '@/lib/auth/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user: JwtPayload;
}

export function withAuth(
  handler: (req: NextRequest, ctx: { params: Record<string, string> }, user: JwtPayload) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: { params: Record<string, string> }) => {
    const token = req.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const user = verifyAccessToken(token);
      return handler(req, ctx, user);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  };
}

export function getAuthUser(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get('access_token')?.value;
  if (!token) return null;

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}
