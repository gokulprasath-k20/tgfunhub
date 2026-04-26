'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Reply } from 'lucide-react';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useComments';
import { useAuthStore } from '@/store/authStore';
import { Skeleton, SkeletonAvatar } from '@/components/ui/Skeleton';
import type { ICommentWithMeta } from '@/types/comment';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data, isLoading } = useComments(postId);
  const { user } = useAuthStore();
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);

  const submit = () => {
    const content = text.trim();
    if (!content) return;
    createComment.mutate(
      { postId, parentId: replyTo?.id, content },
      { onSuccess: () => { setText(''); setReplyTo(null); } }
    );
  };

  if (isLoading) {
    return (
      <div className="mt-3 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-2">
            <SkeletonAvatar size="sm" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Comments list */}
      {(data?.comments ?? []).map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          postId={postId}
          currentUserId={user?.id}
          onReply={(id, username) => {
            setReplyTo({ id, username });
          }}
          onDelete={(commentId) => deleteComment.mutate({ commentId, postId })}
        />
      ))}

      {data?.comments.length === 0 && (
        <p className="text-xs text-[#a3a3a3] dark:text-[#525252] py-2">
          No comments yet. Be the first to comment.
        </p>
      )}

      {/* Reply target indicator */}
      {replyTo && (
        <div className="flex items-center gap-2 text-xs text-[#525252] dark:text-[#a3a3a3] bg-[#f9f9f9] dark:bg-[#1a1a1a] px-3 py-1.5 rounded-md">
          <Reply className="w-3 h-3" />
          <span>Replying to @{replyTo.username}</span>
          <button
            onClick={() => setReplyTo(null)}
            className="ml-auto text-[#a3a3a3] hover:text-[#525252] transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mt-2">
        <div className="w-7 h-7 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a] flex-shrink-0 flex items-center justify-center text-xs font-semibold text-[#525252]">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder={replyTo ? `Reply to @${replyTo.username}…` : 'Add a comment…'}
            maxLength={500}
            className="input-base py-2 text-sm flex-1"
          />
          <button
            onClick={submit}
            disabled={!text.trim() || createComment.isPending}
            className="btn-primary px-3 py-2 text-sm disabled:opacity-40"
          >
            {createComment.isPending ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: ICommentWithMeta;
  postId: string;
  currentUserId?: string;
  onReply: (id: string, username: string) => void;
  onDelete: (id: string) => void;
  isReply?: boolean;
}

function CommentItem({ comment, postId, currentUserId, onReply, onDelete, isReply = false }: CommentItemProps) {
  const author = typeof comment.userId === 'object' ? comment.userId : null;
  const isOwner = currentUserId === author?._id;

  return (
    <div className={`flex gap-2 ${isReply ? 'ml-8 mt-2' : ''}`}>
      <div className="w-7 h-7 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a] flex-shrink-0 overflow-hidden flex items-center justify-center">
        {author?.profileImage ? (
          <Image src={author.profileImage} alt={author.username} width={28} height={28} className="object-cover" />
        ) : (
          <span className="text-xs font-semibold text-[#525252]">
            {author?.username?.[0]?.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-[#f9f9f9] dark:bg-[#1a1a1a] rounded-lg px-3 py-2">
          <span className="text-xs font-semibold text-[#0a0a0a] dark:text-[#fafafa] mr-2">
            {author?.username}
          </span>
          <span className="text-sm text-[#262626] dark:text-[#d4d4d4]">{comment.content}</span>
        </div>

        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-xs text-[#a3a3a3]">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {!isReply && (
            <button
              onClick={() => onReply(comment._id, author?.username ?? '')}
              className="text-xs text-[#a3a3a3] hover:text-[#525252] dark:hover:text-[#a3a3a3] flex items-center gap-1 transition-colors"
            >
              <Reply className="w-3 h-3" /> Reply
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => onDelete(comment._id)}
              className="text-xs text-[#a3a3a3] hover:text-red-500 flex items-center gap-1 transition-colors ml-auto"
              aria-label="Delete comment"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Replies */}
        {comment.replies?.map((reply) => (
          <CommentItem
            key={reply._id}
            comment={reply}
            postId={postId}
            currentUserId={currentUserId}
            onReply={onReply}
            onDelete={onDelete}
            isReply
          />
        ))}
      </div>
    </div>
  );
}
