'use client';

import { useParams, useRouter } from 'next/navigation';
import { useVideo } from '@/hooks/useVideos';
import { useToggleLike, useDeletePost } from '@/hooks/usePosts';
import { LongVideoPlayer } from '@/components/video/LongVideoPlayer';
import { ArrowLeft, Heart, MessageSquare, Share2, MoreHorizontal, Trash } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

export default function VideoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const { data: video, isLoading, error } = useVideo(id as string);
  const { mutate: toggleLike } = useToggleLike(id as string);
  const { mutate: deleteVideo } = useDeletePost();

  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse flex flex-col gap-6">
        <div className="w-full aspect-video bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded-xl" />
        <div className="h-8 bg-[#e5e5e5] dark:bg-[#2a2a2a] w-3/4 rounded" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
          <div className="h-4 bg-[#e5e5e5] dark:bg-[#2a2a2a] w-48 rounded" />
        </div>
      </div>
    );
  }

  if (error || !video || video.type !== 'video') {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Video not found</h2>
        <button onClick={() => router.push('/videos')} className="text-blue-500 hover:underline">
          Go back to videos
        </button>
      </div>
    );
  }

  const isOwner = user?.id === video.userId._id;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this video?')) {
      deleteVideo(video._id, {
        onSuccess: () => router.push('/videos'),
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 pb-10">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#525252] hover:text-[#0a0a0a] dark:text-[#a3a3a3] dark:hover:text-[#fafafa] transition-colors w-max"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <LongVideoPlayer 
          src={video.content.videoUrl!} 
          poster={video.content.thumbnailUrl} 
        />

        <div className="flex flex-col gap-4 mt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a] dark:text-[#fafafa]">
            {video.content.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] overflow-hidden">
                {video.userId.profileImage ? (
                  <Image
                    src={video.userId.profileImage}
                    alt={video.userId.username}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-[#a3a3a3] text-lg">
                    {video.userId.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-[#0a0a0a] dark:text-[#fafafa] hover:underline cursor-pointer">
                  {video.userId.username}
                </p>
                <p className="text-xs text-[#525252] dark:text-[#a3a3a3]">
                  {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleLike()}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                  video.isLiked
                    ? 'bg-red-50 text-red-500 dark:bg-red-500/10'
                    : 'bg-[#f0f0f0] hover:bg-[#e5e5e5] dark:bg-[#1a1a1a] dark:hover:bg-[#2a2a2a] text-[#0a0a0a] dark:text-[#fafafa]'
                }`}
              >
                <Heart className={`w-4 h-4 ${video.isLiked ? 'fill-current' : ''}`} />
                {video.stats.likes}
              </button>
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm bg-[#f0f0f0] hover:bg-[#e5e5e5] dark:bg-[#1a1a1a] dark:hover:bg-[#2a2a2a] text-[#0a0a0a] dark:text-[#fafafa] transition-colors lg:hidden"
              >
                <MessageSquare className="w-4 h-4" />
                {video.stats.comments}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm bg-[#f0f0f0] hover:bg-[#e5e5e5] dark:bg-[#1a1a1a] dark:hover:bg-[#2a2a2a] text-[#0a0a0a] dark:text-[#fafafa] transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              {isOwner && (
                <div className="relative">
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-full bg-[#f0f0f0] hover:bg-[#e5e5e5] dark:bg-[#1a1a1a] dark:hover:bg-[#2a2a2a] text-[#0a0a0a] dark:text-[#fafafa] transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111111] rounded-xl shadow-lg border border-[#e5e5e5] dark:border-[#2a2a2a] py-1 z-10">
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] flex items-center gap-2"
                      >
                        <Trash className="w-4 h-4" />
                        Delete Video
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {video.content.text && (
            <div className="bg-[#f9f9f9] dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl p-4 mt-2 whitespace-pre-wrap text-sm text-[#0a0a0a] dark:text-[#fafafa]">
              {video.content.text}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Area (Comments on Desktop, hidden or below on Mobile) */}
      <div className={`w-full lg:w-96 flex flex-col ${showComments ? 'block' : 'hidden lg:flex'}`}>
        <div className="bg-white dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col h-[600px] lg:h-auto lg:sticky lg:top-[100px]">
          <div className="p-4 border-b border-[#e5e5e5] dark:border-[#2a2a2a] font-semibold text-[#0a0a0a] dark:text-[#fafafa]">
            Comments ({video.stats.comments})
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="w-12 h-12 text-[#e5e5e5] dark:text-[#2a2a2a] mb-4" />
            <p className="text-[#a3a3a3]">Comments for long-form videos are coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
