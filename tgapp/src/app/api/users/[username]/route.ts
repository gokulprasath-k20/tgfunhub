import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

// GET /api/users/[username] — public profile
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    await connectDB();

    const user = await User.findOne({ username })
      .select('username profileImage bio isPrivate createdAt')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[GET /api/users/[username]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
