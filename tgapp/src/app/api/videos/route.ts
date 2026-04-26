import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import { getAuthUser } from '@/lib/auth/middleware';
import { CreateVideoSchema } from '@/lib/validators/post';

import { fetchTrendingVideos } from '@/lib/utils/youtube';

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const source = searchParams.get('source') || 'all'; // 'local', 'youtube', or 'all'

    await connectDB();

    let localVideos: any[] = [];
    if (source === 'local' || source === 'all') {
      const query: Record<string, unknown> = { type: 'video' };
      if (cursor) {
        query._id = { $lt: cursor };
      }
      localVideos = await Post.find(query)
        .sort({ createdAt: -1 })
        .limit(PAGE_SIZE)
        .populate('userId', 'username profileImage')
        .lean();
    }

    let youtubeVideos: any[] = [];
    if (source === 'youtube' || (source === 'all' && localVideos.length < PAGE_SIZE)) {
      try {
        const count = source === 'youtube' ? PAGE_SIZE : PAGE_SIZE - localVideos.length;
        youtubeVideos = await fetchTrendingVideos(count);
      } catch (err) {
        console.error('[YouTube API Error]', err);
      }
    }

    const allVideos = [...localVideos, ...youtubeVideos].map((video: any) => ({
      ...video,
      isLiked: user && video.likes ? video.likes.includes(user.sub) : false,
      likes: undefined,
    }));

    const nextCursor = localVideos.length === PAGE_SIZE ? String(localVideos[localVideos.length - 1]._id) : null;

    return NextResponse.json({ posts: allVideos, nextCursor, hasMore: !!nextCursor });
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
