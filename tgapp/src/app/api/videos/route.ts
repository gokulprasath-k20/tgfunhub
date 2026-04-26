import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import { getAuthUser } from '@/lib/auth/middleware';
import { CreateVideoSchema } from '@/lib/validators/post';

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    // Videos might be public, but we get the user to check likes
    
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');

    await connectDB();

    const query: Record<string, unknown> = { type: 'video' };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const videos = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(PAGE_SIZE + 1)
      .populate('userId', 'username profileImage')
      .lean();

    const hasMore = videos.length > PAGE_SIZE;
    const result = hasMore ? videos.slice(0, PAGE_SIZE) : videos;

    const formattedVideos = result.map((video: any) => ({
      ...video,
      isLiked: user ? video.likes?.includes(user.sub) : false,
      likes: undefined, // Remove heavy array
    }));

    const nextCursor = hasMore ? String(result[result.length - 1]._id) : null;

    return NextResponse.json({ posts: formattedVideos, nextCursor, hasMore });
  } catch (error) {
    console.error('[GET /api/videos]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const result = CreateVideoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: result.error.issues },
        { status: 400 }
      );
    }

    await connectDB();

    const videoPost = await Post.create({
      userId: user.sub,
      type: 'video',
      content: {
        title: result.data.title,
        text: result.data.text || '',
        videoUrl: result.data.videoUrl,
        thumbnailUrl: result.data.thumbnailUrl,
      },
    });

    const populatedVideo = await Post.findById(videoPost._id)
      .populate('userId', 'username profileImage')
      .lean();

    return NextResponse.json({ video: populatedVideo }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/videos]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
