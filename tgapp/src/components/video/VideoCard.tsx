'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import type { IPostWithMeta } from '@/types/post';

interface VideoCardProps {
  video: IPostWithMeta;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/videos/${video._id}`} className="group flex flex-col gap-3">
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#e5e5e5] dark:bg-[#2a2a2a]">
        {video.content.thumbnailUrl ? (
          <Image
            src={video.content.thumbnailUrl}
            alt={video.content.title || 'Video thumbnail'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : video.content.videoUrl ? (
          // Fallback if no thumbnail: we just use the video tag but paused to grab first frame
          <video
            src={`${video.content.videoUrl}#t=0.1`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            muted
            playsInline
          />
        ) : null}
        
        {/* Duration badge placeholder - In a real app we'd store duration in DB */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded-md text-white text-xs font-medium">
          {video.content.videoUrl ? 'HD' : '...'}
        </div>
      </div>

      {/* Meta */}
      <div className="flex gap-3 px-1">
        <div className="w-9 h-9 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] overflow-hidden flex-shrink-0">
          {video.userId.profileImage ? (
            <Image
              src={video.userId.profileImage}
              alt={video.userId.username}
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-[#a3a3a3]">
              {video.userId.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <h3 className="font-semibold text-base text-[#0a0a0a] dark:text-[#fafafa] line-clamp-2 leading-snug group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
            {video.content.title || 'Untitled Video'}
          </h3>
          <p className="text-sm text-[#525252] dark:text-[#a3a3a3] mt-1 hover:underline">
            {video.userId.username}
          </p>
          <div className="text-xs text-[#a3a3a3] flex items-center gap-1 mt-0.5">
            <span>{video.stats.likes} likes</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
