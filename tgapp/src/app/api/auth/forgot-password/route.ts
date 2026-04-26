import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { sendPasswordResetEmail } from '@/lib/email/nodemailer';
import { rateLimit } from '@/lib/utils/rate-limit';
import { ForgotPasswordSchema } from '@/lib/validators/auth';

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email } = parsed.data;

    await connectDB();

    // Always return success to avoid email enumeration
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && user.emailVerified) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await User.findByIdAndUpdate(user._id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      });

      sendPasswordResetEmail(email, resetToken).catch((err) =>
        console.error('[Email] Password reset send error:', err)
      );
    }

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('[ForgotPassword]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
