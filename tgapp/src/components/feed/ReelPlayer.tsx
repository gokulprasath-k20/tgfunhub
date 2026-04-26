'use client';

import { useEffect, useRef, useState } from 'react';
import type { IPostWithMeta } from '@/types/post';
import { useToggleLike } from '@/hooks/usePosts';
import { Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ReelPlayerProps {
  reel: IPostWithMeta;
  isActive: boolean;
  onCommentClick: () => void;
}

export function ReelPlayer({ reel, isActive, onCommentClick }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const toggleLike = useToggleLike(reel._id);

  // Handle play/pause based on intersection (isActive)
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      // Small timeout to ensure it plays smoothly after snap
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Auto-play prevented:', error);
          // Browsers might block autoplay if not muted or no user interaction
          setIsMuted(true);
          videoRef.current?.play().catch((e) => console.error('Play still blocked:', e));
        });
      }
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleVideoTap = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-112px)] md:h-[calc(100vh-56px)] bg-black snap-start snap-always flex items-center justify-center overflow-hidden">
      {/* Video element */}
      {reel.content.videoUrl && (
        <video
          ref={videoRef}
          src={reel.content.videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
          onClick={handleVideoTap}
        />
      )}

      {/* Overlay - Top Gradient */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

      {/* Overlay - Bottom Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Right Actions Bar */}
      <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6 z-10">
        <Link href={`/profile/${reel.userId.username}`} className="mb-2">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-[#2a2a2a]">
            {reel.userId.profileImage ? (
              <Image
                src={reel.userId.profileImage}
                alt={reel.userId.username}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {reel.userId.username[0].toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <button
          onClick={() => toggleLike.mutate()}
          className="flex flex-col items-center gap-1 group"
          disabled={toggleLike.isPending}
        >
          <div className="p-3 rounded-full bg-black/40 group-hover:bg-black/60 transition-colors">
            <Heart
              className={`w-7 h-7 transition-colors ${
                reel.isLiked ? 'fill-white text-white' : 'text-white'
              }`}
            />
          </div>
          <span className="text-white text-xs font-semibold">{reel.stats.likes}</span>
        </button>

        <button
          onClick={onCommentClick}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 rounded-full bg-black/40 group-hover:bg-black/60 transition-colors">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{reel.stats.comments}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="p-3 rounded-full bg-black/40 group-hover:bg-black/60 transition-colors">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">Share</span>
        </button>
      </div>

      {/* Bottom Info Area */}
      <div className="absolute bottom-4 left-4 right-20 z-10 text-white">
        <Link href={`/profile/${reel.userId.username}`}>
          <h3 className="font-bold text-base hover:underline mb-1">
            @{reel.userId.username}
          </h3>
        </Link>
        {reel.content.text && (
          <p className="text-sm line-clamp-3 text-white/90">{reel.content.text}</p>
        )}
      </div>
    </div>
  );
}
