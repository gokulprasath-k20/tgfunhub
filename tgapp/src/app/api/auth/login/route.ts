import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { comparePassword } from '@/lib/auth/bcrypt';
import { signAccessToken, signRefreshToken, COOKIE_OPTIONS, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from '@/lib/auth/jwt';
import { LoginSchema } from '@/lib/validators/auth';
import { rateLimit } from '@/lib/utils/rate-limit';

const MAX_LOGIN_ATTEMPTS = 10;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const rl = await rateLimit(req);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `Account locked. Try again in ${minutesLeft} minutes.` },
        { status: 423 }
      );
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      // Increment failed attempts
      const attempts = (user.loginAttempts || 0) + 1;
      const updateData: Record<string, unknown> = { loginAttempts: attempts };

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        updateData.loginAttempts = 0;
      }

      await User.findByIdAndUpdate(user._id, updateData);

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check email verification
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in.' },
        { status: 403 }
      );
    }

    // Reset login attempts on success
    await User.findByIdAndUpdate(user._id, {
      loginAttempts: 0,
      lockUntil: undefined,
    });

    const tokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Store refresh token hash in DB
    await User.findByIdAndUpdate(user._id, { refreshToken });

    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
      },
    });

    response.cookies.set('access_token', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    response.cookies.set('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('[Login]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
