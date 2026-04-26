import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import Like from '@/lib/db/models/Like';
import Comment from '@/lib/db/models/Comment';
import { getAuthUser } from '@/lib/auth/middleware';

// DELETE /api/posts/[postId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.userId.toString() !== user.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cascade delete likes and comments
    await Promise.all([
      Post.findByIdAndDelete(params.postId),
      Like.deleteMany({ postId: params.postId }),
      Comment.deleteMany({ postId: params.postId }),
    ]);

    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('[DELETE /api/posts/[postId]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
