import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { hashPassword } from '@/lib/auth/bcrypt';
import { RegisterSchema } from '@/lib/validators/auth';
import { sendVerificationEmail } from '@/lib/email/nodemailer';
import { rateLimit } from '@/lib/utils/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rl = await rateLimit(req);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.resetIn) } }
      );
    }

    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, username } = parsed.data;

    await connectDB();

    // Check existing user
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    }).lean();

    if (existing) {
      const field =
        (existing as { email: string }).email === email.toLowerCase()
          ? 'Email'
          : 'Username';
      return NextResponse.json(
        { error: `${field} is already taken` },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      username,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, verificationToken).catch((err) =>
      console.error('[Email] Verification send error:', err)
    );

    return NextResponse.json(
      {
        message: 'Account created. Please check your email to verify your account.',
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Register]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
