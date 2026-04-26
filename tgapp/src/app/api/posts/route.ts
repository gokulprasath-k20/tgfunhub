import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import Like from '@/lib/db/models/Like';
import { getAuthUser } from '@/lib/auth/middleware';
import { CreatePostSchema } from '@/lib/validators/post';

const PAGE_SIZE = 10;

// GET /api/posts — paginated feed
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const username = searchParams.get('username'); // for profile feed

    await connectDB();

    const query: Record<string, unknown> = { type: 'text' };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    if (username) {
      const UserModel = (await import('@/lib/db/models/User')).default;
      const profileUser = await UserModel.findOne({ username }).lean();
      if (!profileUser) {
        return NextResponse.json({ posts: [], nextCursor: null, hasMore: false });
      }
      query.userId = (profileUser as { _id: unknown })._id;
    }

    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(PAGE_SIZE + 1)
      .populate('userId', 'username profileImage')
      .lean();

    const hasMore = posts.length > PAGE_SIZE;
    const result = hasMore ? posts.slice(0, PAGE_SIZE) : posts;
    const nextCursor = hasMore ? String(result[result.length - 1]._id) : null;

    // Check which posts the current user has liked
    const postIds = result.map((p) => p._id);
    const userLikes = await Like.find({
      userId: user.sub,
      postId: { $in: postIds },
    }).lean();

    const likedSet = new Set(userLikes.map((l) => String(l.postId)));

    const postsWithMeta = result.map((post) => ({
      ...post,
      isLiked: likedSet.has(String(post._id)),
    }));

    return NextResponse.json({ posts: postsWithMeta, nextCursor, hasMore });
  } catch (error) {
    console.error('[GET /api/posts]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts — create post
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreatePostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const post = await Post.create({
      userId: user.sub,
      content: {
        text: parsed.data.text,
        images: parsed.data.images || [],
      },
    });

    const populated = await Post.findById(post._id)
      .populate('userId', 'username profileImage')
      .lean();

    return NextResponse.json({ post: { ...populated, isLiked: false } }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/posts]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
