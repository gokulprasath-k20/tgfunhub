import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import Like from '@/lib/db/models/Like';
import { getAuthUser } from '@/lib/auth/middleware';

// POST /api/posts/[postId]/like — toggle like
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const existing = await Like.findOne({
      userId: user.sub,
      postId: postId,
    });

    let liked: boolean;
    let delta: number;

    if (existing) {
      // Unlike
      await Like.findByIdAndDelete(existing._id);
      delta = -1;
      liked = false;
    } else {
      // Like
      await Like.create({ userId: user.sub, postId: postId });
      delta = 1;
      liked = true;
    }

    // Update denormalized count
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { 'stats.likes': delta } },
      { new: true }
    );

    return NextResponse.json({
      liked,
      likesCount: post?.stats.likes ?? 0,
    });
  } catch (error) {
    console.error('[POST /api/posts/[postId]/like]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
