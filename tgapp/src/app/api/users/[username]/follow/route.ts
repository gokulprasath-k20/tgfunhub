import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import Follow from '@/lib/db/models/Follow';
import { getAuthUser } from '@/lib/auth/middleware';

// POST /api/users/[username]/follow — toggle follow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const targetUser = await User.findOne({ username }).lean();
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUserId = String(targetUser._id);

    if (authUser.sub === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const existingFollow = await Follow.findOne({
      followerId: authUser.sub,
      followingId: targetUserId,
    });

    if (existingFollow) {
      await Follow.deleteOne({ _id: existingFollow._id });
      return NextResponse.json({ status: 'unfollowed' });
    }

    const status = (targetUser as any).isPrivate ? 'pending' : 'accepted';
    await Follow.create({
      followerId: authUser.sub,
      followingId: targetUserId,
      status,
    });

    return NextResponse.json({ status });
  } catch (error) {
    console.error('[POST /api/users/[username]/follow]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/users/[username]/follow — check follow status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const authUser = getAuthUser(req);
    if (!authUser) return NextResponse.json({ isFollowing: false });

    await connectDB();

    const targetUser = await User.findOne({ username }).select('_id').lean();
    if (!targetUser) return NextResponse.json({ isFollowing: false });

    const follow = await Follow.findOne({
      followerId: authUser.sub,
      followingId: String(targetUser._id),
    });

    return NextResponse.json({
      isFollowing: !!follow,
      status: follow?.status || null,
    });
  } catch (error) {
    return NextResponse.json({ isFollowing: false });
  }
}
