'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useReels } from '@/hooks/useReels';
import { ReelPlayer } from '@/components/feed/ReelPlayer';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';
import { CommentSection } from '@/components/feed/CommentSection';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { Video } from 'lucide-react';

export default function ReelsPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useReels();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track which reel is currently in view
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  // Set up intersection observer for snapping and auto-playing
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const reelId = entry.target.getAttribute('data-reel-id');
            if (reelId) {
              setActiveReelId(reelId);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6, // Trigger when 60% of the video is visible
      }
    );

    const elements = document.querySelectorAll('.reel-container');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [data?.pages]); // Re-run when new pages load

  // Infinite scroll detector
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px',
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (status === 'pending') {
    return (
      <div className="max-w-[450px] mx-auto w-full h-[calc(100vh-112px)] md:h-[calc(100vh-56px)] flex flex-col gap-4 py-4">
        <FeedSkeleton />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <p className="text-[#a3a3a3]">Failed to load reels.</p>
      </div>
    );
  }

  const allReels = data.pages.flatMap((page) => page.posts);

  if (allReels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
          <Video className="w-8 h-8 text-[#a3a3a3]" />
        </div>
        <h2 className="text-xl font-semibold text-[#0a0a0a] dark:text-[#fafafa] mb-2">
          No reels yet
        </h2>
        <p className="text-[#525252] dark:text-[#a3a3a3] mb-6 max-w-sm">
          Be the first to share a video moment with the community.
        </p>
        <Link
          href="/reels/create"
          className="px-6 py-2 bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Create Reel
        </Link>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="w-full max-w-[500px] mx-auto h-[calc(100vh-112px)] md:h-[calc(100vh-56px)] overflow-y-scroll snap-y snap-mandatory bg-black hide-scrollbar relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="absolute top-4 right-4 z-50 hidden md:block">
          <Link
            href="/reels/create"
            className="px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition-all shadow-lg"
          >
            + Create
          </Link>
        </div>

        {allReels.map((reel) => (
          <div
            key={reel._id}
            data-reel-id={reel._id}
            className="reel-container snap-start snap-always w-full h-full"
          >
            <ReelPlayer
              reel={reel}
              isActive={activeReelId === reel._id}
              onCommentClick={() => setActiveCommentPostId(reel._id)}
            />
          </div>
        ))}

        <div ref={loadMoreRef} className="h-10 w-full shrink-0 flex items-center justify-center bg-black">
          {isFetchingNextPage && (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          )}
        </div>
      </div>

      <Modal
        isOpen={!!activeCommentPostId}
        onClose={() => setActiveCommentPostId(null)}
        title="Comments"
      >
        {activeCommentPostId && <CommentSection postId={activeCommentPostId} />}
      </Modal>
    </>
  );
}
