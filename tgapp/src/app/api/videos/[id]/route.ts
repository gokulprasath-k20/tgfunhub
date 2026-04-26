import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import { getAuthUser } from '@/lib/auth/middleware';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(req);
    await connectDB();

    const video = await Post.findOne({ _id: params.id, type: 'video' })
      .populate('userId', 'username profileImage')
      .lean();

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const formattedVideo = {
      ...video,
      isLiked: user ? (video as any).likes?.includes(user.sub) : false,
      likes: undefined,
    };

    return NextResponse.json({ video: formattedVideo });
  } catch (error) {
    console.error('[GET /api/videos/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
