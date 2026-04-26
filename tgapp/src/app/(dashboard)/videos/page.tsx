'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useVideos } from '@/hooks/useVideos';
import { VideoCard } from '@/components/video/VideoCard';
import { PlaySquare, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState<'local' | 'youtube'>('local');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useVideos(activeSource);
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
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
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

  const videos = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0a0a0a] dark:text-[#fafafa] flex items-center gap-3 tracking-tight">
            <PlaySquare className="w-8 h-8 text-blue-500" />
            Discover
          </h1>
          <p className="text-[#a3a3a3] mt-1 text-sm">Explore trending content across the community and YouTube.</p>
        </div>

        <div className="flex flex-1 max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
            <input
              type="text"
              placeholder="Search community or YouTube..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111111] text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/videos/create">
            <Button size="sm" className="h-10 rounded-xl px-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Upload
            </Button>
          </Link>
        </div>
      </div>

      {/* Source Selector Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-xl w-max mb-8">
        <button
          onClick={() => setActiveSource('local')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeSource === 'local' ? 'bg-white dark:bg-[#2a2a2a] shadow-sm text-[#0a0a0a] dark:text-[#fafafa]' : 'text-[#a3a3a3] hover:text-[#525252]'}`}
        >
          Community
        </button>
        <button
          onClick={() => setActiveSource('youtube')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeSource === 'youtube' ? 'bg-white dark:bg-[#2a2a2a] shadow-sm text-[#0a0a0a] dark:text-[#fafafa]' : 'text-[#a3a3a3] hover:text-[#525252]'}`}
        >
          YouTube Trending
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
            <PlaySquare className="w-8 h-8 text-[#a3a3a3]" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-[#0a0a0a] dark:text-[#fafafa]">No videos found</h2>
          <p className="text-[#a3a3a3] text-sm">Be the first to upload or check trending videos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}

      <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-8">
        {isFetchingNextPage && (
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
