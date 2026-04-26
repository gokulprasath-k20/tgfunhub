'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';
import type { IPostWithMeta } from '@/types/post';
import { useAuthStore } from '@/store/authStore';
import { useToggleLike, useDeletePost } from '@/hooks/usePosts';
import { CommentSection } from './CommentSection';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface PostCardProps {
  post: IPostWithMeta;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const toggleLike = useToggleLike(post._id);
  const deletePost = useDeletePost();

  const author = typeof post.userId === 'object' ? post.userId : null;
  const isOwner = user?.id === (author?._id ?? post.userId);

  const handleLike = () => {
    toggleLike.mutate();
  };

  const handleDelete = () => {
    deletePost.mutate(post._id, {
      onSuccess: () => setShowDeleteModal(false),
    });
  };

  return (
    <article className="card padding-none border-b border-[#e5e5e5] dark:border-[#2a2a2a] last:border-b-0 rounded-none first:rounded-t-lg last:rounded-b-lg">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <Link
            href={`/profile/${author?.username ?? ''}`}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#e5e5e5] dark:bg-[#2a2a2a] flex-shrink-0">
              {author?.profileImage ? (
                <Image
                  src={author.profileImage}
                  alt={author.username}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-[#525252] dark:text-[#a3a3a3]">
                  {author?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0a0a0a] dark:text-[#fafafa] group-hover:underline">
                {author?.username ?? 'unknown'}
              </p>
              <p className="text-xs text-[#a3a3a3] dark:text-[#525252]">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="btn-ghost p-1.5 rounded-md"
                aria-label="Post options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg shadow-[0_4px_12px_rgb(0,0,0,0.1)] py-1">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteModal(true);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete post
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-[#0a0a0a] dark:text-[#fafafa] leading-relaxed mb-3 whitespace-pre-wrap">
          {post.content.text}
        </p>

        {/* Images */}
        {post.content.images && post.content.images.length > 0 && (
          <div
            className={`grid gap-2 mb-3 rounded-lg overflow-hidden ${
              post.content.images.length === 1
                ? 'grid-cols-1'
                : post.content.images.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-2'
            }`}
          >
            {post.content.images.slice(0, 4).map((url, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-lg bg-[#f9f9f9] dark:bg-[#1a1a1a] ${
                  post.content.images!.length === 1 ? 'aspect-video' : 'aspect-square'
                }`}
              >
                <Image
                  src={url}
                  alt={`Post image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 600px"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-1 border-t border-[#f0f0f0] dark:border-[#1f1f1f]">
          <button
            onClick={handleLike}
            disabled={toggleLike.isPending}
            className={`flex items-center gap-1.5 py-2 text-sm transition-all duration-150 ${
              post.isLiked
                ? 'text-red-500'
                : 'text-[#a3a3a3] dark:text-[#525252] hover:text-[#525252] dark:hover:text-[#a3a3a3]'
            }`}
            aria-label={post.isLiked ? 'Unlike post' : 'Like post'}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-150 ${
                post.isLiked ? 'fill-red-500 scale-110' : ''
              }`}
            />
            <span className="tabular-nums">{post.stats.likes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 py-2 text-sm text-[#a3a3a3] dark:text-[#525252] hover:text-[#525252] dark:hover:text-[#a3a3a3] transition-colors duration-150"
            aria-label="Toggle comments"
            aria-expanded={showComments}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="tabular-nums">{post.stats.comments}</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-[#f0f0f0] dark:border-[#1f1f1f] px-4 pb-4">
          <CommentSection postId={post._id} />
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete post"
        size="sm"
      >
        <p className="text-sm text-[#525252] dark:text-[#a3a3a3] mb-6">
          This will permanently delete your post and all its comments. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deletePost.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </article>
  );
}
