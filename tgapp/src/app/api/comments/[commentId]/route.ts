import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Comment from '@/lib/db/models/Comment';
import Post from '@/lib/db/models/Post';
import { getAuthUser } from '@/lib/auth/middleware';

// DELETE /api/comments/[commentId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.userId.toString() !== user.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isTopLevel = !comment.parentId;

    // Delete comment and its replies
    await Promise.all([
      Comment.findByIdAndDelete(commentId),
      Comment.deleteMany({ parentId: commentId }),
    ]);

    // Decrement count only for top-level
    if (isTopLevel) {
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { 'stats.comments': -1 },
      });
    }

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('[DELETE /api/comments/[commentId]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
