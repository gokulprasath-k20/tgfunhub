import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Comment from '@/lib/db/models/Comment';
import Post from '@/lib/db/models/Post';
import { getAuthUser } from '@/lib/auth/middleware';
import { CreateCommentSchema } from '@/lib/validators/post';

// POST /api/comments — create comment
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { postId, parentId, content } = parsed.data;

    await connectDB();

    // Enforce max nesting depth 2
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (parentComment?.parentId) {
        return NextResponse.json(
          { error: 'Maximum comment depth reached' },
          { status: 400 }
        );
      }
    }

    const comment = await Comment.create({
      userId: user.sub,
      postId,
      parentId: parentId || null,
      content,
    });

    // Update denormalized count (only top-level increments)
    if (!parentId) {
      await Post.findByIdAndUpdate(postId, { $inc: { 'stats.comments': 1 } });
    }

    const populated = await Comment.findById(comment._id)
      .populate('userId', 'username profileImage')
      .lean();

    return NextResponse.json({ comment: populated }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/comments]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/comments?postId=xxx — get comments for a post
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    if (!postId) {
      return NextResponse.json({ error: 'postId required' }, { status: 400 });
    }

    await connectDB();

    // Fetch all comments for post, build nested structure client-side
    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 })
      .populate('userId', 'username profileImage')
      .lean();

    // Build tree: top-level + replies
    const topLevel = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);

    const tree = topLevel.map((comment) => ({
      ...comment,
      replies: replies.filter(
        (r) => r.parentId?.toString() === comment._id.toString()
      ),
    }));

    return NextResponse.json({ comments: tree });
  } catch (error) {
    console.error('[GET /api/comments]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
