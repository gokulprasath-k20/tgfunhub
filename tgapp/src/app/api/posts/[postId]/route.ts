import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import Like from '@/lib/db/models/Like';
import Comment from '@/lib/db/models/Comment';
import { getAuthUser } from '@/lib/auth/middleware';

// DELETE /api/posts/[postId]
export async function DELETE(
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

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.userId.toString() !== user.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cascade delete likes and comments
    await Promise.all([
      Post.findByIdAndDelete(postId),
      Like.deleteMany({ postId: postId }),
      Comment.deleteMany({ postId: postId }),
    ]);

    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('[DELETE /api/posts/[postId]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
