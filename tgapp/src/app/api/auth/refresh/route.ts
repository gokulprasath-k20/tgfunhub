import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { verifyRefreshToken, signAccessToken, signRefreshToken, COOKIE_OPTIONS, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const payload = verifyRefreshToken(refreshToken);

    await connectDB();

    const user = await User.findById(payload.sub);
    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const tokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    // Rotate tokens
    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    const response = NextResponse.json({ success: true });
    response.cookies.set('access_token', newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    response.cookies.set('refresh_token', newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
