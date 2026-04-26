import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    await connectDB();

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link.' },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(user._id, {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    return NextResponse.json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('[VerifyEmail]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
