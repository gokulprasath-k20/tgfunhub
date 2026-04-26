import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import { getAuthUser } from '@/lib/auth/middleware';
import { UpdateProfileSchema } from '@/lib/validators/user';
import { comparePassword, hashPassword } from '@/lib/auth/bcrypt';
import { ChangePasswordSchema } from '@/lib/validators/auth';

// GET /api/users/profile — current user's full profile
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const profile = await User.findById(user.sub)
      .select('-password -emailVerificationToken -passwordResetToken -refreshToken -mfaSecret -loginAttempts -lockUntil')
      .lean();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error('[GET /api/users/profile]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/users/profile — update profile or change password
export async function PUT(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();

    // Check if this is a password change request
    if (body.currentPassword !== undefined) {
      const parsed = ChangePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
      }

      await connectDB();
      const user = await User.findById(authUser.sub);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isValid = await comparePassword(parsed.data.currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(parsed.data.newPassword);
      await User.findByIdAndUpdate(authUser.sub, {
        password: hashedPassword,
        refreshToken: undefined, // Invalidate all sessions
      });

      return NextResponse.json({ message: 'Password changed successfully' });
    }

    // Profile update
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    // Check username uniqueness if changing
    if (parsed.data.username) {
      const existing = await User.findOne({
        username: parsed.data.username,
        _id: { $ne: authUser.sub },
      }).lean();

      if (existing) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
      }
    }

    const updated = await User.findByIdAndUpdate(
      authUser.sub,
      { $set: parsed.data },
      { new: true }
    ).select('-password -emailVerificationToken -passwordResetToken -refreshToken -mfaSecret -loginAttempts -lockUntil');

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('[PUT /api/users/profile]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
