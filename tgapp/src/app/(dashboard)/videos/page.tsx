'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useVideos } from '@/hooks/useVideos';
import { VideoCard } from '@/components/video/VideoCard';
import { PlaySquare } from 'lucide-react';
import Link from 'next/link';

export default function VideosPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useVideos();
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
    const observer = new IntersectionObserver(handleObserver, { rootMargin: '200px' });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (status === 'pending') {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col gap-3 animate-pulse">
              <div className="aspect-video bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded-xl w-full" />
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded w-3/4" />
                  <div className="h-3 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return <div className="text-center p-8 text-red-500">Failed to load videos.</div>;
  }

  const videos = data.pages.flatMap((page) => page.posts);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#0a0a0a] dark:text-[#fafafa] flex items-center gap-2">
          <PlaySquare className="w-6 h-6" />
          Videos
        </h1>
        <Link
          href="/videos/create"
          className="px-4 py-2 bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Upload Video
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
            <PlaySquare className="w-8 h-8 text-[#a3a3a3]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No videos found</h2>
          <p className="text-[#a3a3a3]">Be the first to upload a video.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}

      <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-4">
        {isFetchingNextPage && (
          <div className="w-6 h-6 border-2 border-[#0a0a0a] dark:border-[#fafafa] border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
