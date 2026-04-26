'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Trash2, MoreHorizontal, Send, Bookmark } from 'lucide-react';
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
    <article className="bg-white dark:bg-[#0a0a0a] border-b border-[#e5e5e5] dark:border-[#262626] md:border md:rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <Link
          href={`/profile/${author?.username ?? ''}`}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#e5e5e5] dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#262626]">
            {author?.profileImage ? (
              <Image
                src={author.profileImage}
                alt={author.username}
                fill
                className="object-cover"
                sizes="32px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#a3a3a3]">
                {author?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#0a0a0a] dark:text-[#fafafa] leading-none">
              {author?.username ?? 'unknown'}
            </p>
            <p className="text-[10px] text-[#a3a3a3] dark:text-[#525252] mt-0.5">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {isOwner && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-[#f9f9f9] dark:hover:bg-[#111111] rounded-full transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-[#737373]" />
          </button>
        )}
      </div>

      {/* Images - Instagram style full width */}
      {post.content.images && post.content.images.length > 0 && (
        <div className="relative aspect-square w-full bg-[#f9f9f9] dark:bg-[#111111]">
          <Image
            src={post.content.images[0]}
            alt="Post content"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 600px"
            priority={false}
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-3 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={toggleLike.isPending}
            className={`transition-transform active:scale-125 ${post.isLiked ? 'text-red-500' : 'text-[#0a0a0a] dark:text-[#fafafa]'}`}
          >
            <Heart className={`w-7 h-7 ${post.isLiked ? 'fill-current' : 'stroke-[1.5px]'}`} />
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-[#0a0a0a] dark:text-[#fafafa] transition-transform active:scale-125"
          >
            <MessageCircle className="w-7 h-7 stroke-[1.5px]" />
          </button>

          <button className="text-[#0a0a0a] dark:text-[#fafafa] transition-transform active:scale-125">
            <Send className="w-7 h-7 stroke-[1.5px]" />
          </button>
        </div>

        <button className="text-[#0a0a0a] dark:text-[#fafafa]">
          <Bookmark className="w-7 h-7 stroke-[1.5px]" />
        </button>
      </div>

      {/* Likes Count */}
      <div className="px-3 pt-2">
        <p className="text-sm font-bold">{post.stats.likes.toLocaleString()} likes</p>
      </div>

      {/* Caption */}
      <div className="px-3 pt-1.5 pb-2">
        <p className="text-sm leading-relaxed">
          <span className="font-bold mr-2">{author?.username}</span>
          <span className="text-[#0a0a0a] dark:text-[#fafafa] whitespace-pre-wrap">{post.content.text}</span>
        </p>
        
        {post.stats.comments > 0 && !showComments && (
          <button 
            onClick={() => setShowComments(true)}
            className="text-sm text-[#a3a3a3] dark:text-[#737373] mt-1.5 block"
          >
            View all {post.stats.comments} comments
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-3 pb-4 border-t border-[#f0f0f0] dark:border-[#1f1f1f] mt-2">
          <CommentSection postId={post._id} />
        </div>
      )}

      {/* Menus/Modals */}
      {showMenu && (
        <Modal isOpen={showMenu} onClose={() => setShowMenu(false)} size="sm">
          <div className="flex flex-col divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a]">
            <button 
              onClick={() => { setShowMenu(false); setShowDeleteModal(true); }}
              className="py-4 text-sm font-bold text-red-500 active:bg-[#f9f9f9] dark:active:bg-[#111111]"
            >
              Delete
            </button>
            <button onClick={() => setShowMenu(false)} className="py-4 text-sm">Cancel</button>
          </div>
        </Modal>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete post?" size="sm">
        <p className="text-sm text-[#737373] mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deletePost.isPending}>Delete</Button>
        </div>
      </Modal>
    </article>
  );
}
