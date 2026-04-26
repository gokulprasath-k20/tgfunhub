import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import Like from '@/lib/db/models/Like';
import { getAuthUser } from '@/lib/auth/middleware';
import { CreateReelSchema } from '@/lib/validators/post';

const PAGE_SIZE = 5;

// GET /api/reels — paginated reel feed
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');

    await connectDB();

    const query: Record<string, unknown> = { type: 'reel' };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const reels = await Post.find(query)
      .sort({ _id: -1 })
      .limit(PAGE_SIZE + 1)
      .populate('userId', 'username profileImage')
      .lean();

    const hasMore = reels.length > PAGE_SIZE;
    const result = hasMore ? reels.slice(0, PAGE_SIZE) : reels;
    const nextCursor = hasMore ? String(result[result.length - 1]._id) : null;

    // Check which reels the current user has liked
    const postIds = result.map((p) => p._id);
    const userLikes = await Like.find({
      userId: user.sub,
      postId: { $in: postIds },
    }).lean();

    const likedSet = new Set(userLikes.map((l) => String(l.postId)));

    const reelsWithMeta = result.map((post) => ({
      ...post,
      isLiked: likedSet.has(String(post._id)),
    }));

    return NextResponse.json({ posts: reelsWithMeta, nextCursor, hasMore });
  } catch (error) {
    console.error('[GET /api/reels]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reels — create reel
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateReelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const post = await Post.create({
      userId: user.sub,
      type: 'reel',
      content: {
        text: parsed.data.text || '',
        images: [],
        videoUrl: parsed.data.videoUrl,
      },
    });

    const populated = await Post.findById(post._id)
      .populate('userId', 'username profileImage')
      .lean();

    return NextResponse.json({ post: { ...populated, isLiked: false } }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/reels]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
