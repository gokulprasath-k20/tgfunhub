'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Music2, Play, Search, TrendingUp, Radio } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

async function fetchMusic(category: string) {
  const res = await fetch(`/api/music?category=${category}`);
  if (!res.ok) throw new Error('Failed to fetch music');
  return res.json();
}

export default function MusicPage() {
  const [category, setCategory] = useState<'all' | 'tamil' | 'english'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['music', category],
    queryFn: () => fetchMusic(category),
  });

  const videos = data?.videos || [];

  const filteredVideos = videos.filter((v: any) => 
    v.content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.userId.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedVideos = filteredVideos.slice(0, visibleCount);

  const handleTabChange = (newCategory: 'all' | 'tamil' | 'english') => {
    setCategory(newCategory);
    setVisibleCount(12);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0a0a0a] dark:text-[#fafafa] flex items-center gap-2 md:gap-3 tracking-tighter italic">
            <Radio className="w-8 h-8 md:w-10 md:h-10 text-pink-500 animate-pulse" />
            SOUNDHUB
          </h1>
          <p className="text-[#a3a3a3] mt-1 md:mt-2 text-sm md:text-base font-medium">Your ultimate destination for hits.</p>
        </div>

        <div className="relative flex-1 max-w-md mt-2 md:mt-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
          <input
            type="text"
            placeholder="Search songs, artists..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111111] text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${category === 'all' ? 'bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black' : 'bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#525252] dark:text-[#a3a3a3]'}`}
        >
          All Mix
        </button>
        <button
          onClick={() => handleTabChange('tamil')}
          className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${category === 'tamil' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#525252] dark:text-[#a3a3a3]'}`}
        >
          Tamil Hits
        </button>
        <button
          onClick={() => handleTabChange('english')}
          className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${category === 'english' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#525252] dark:text-[#a3a3a3]'}`}
        >
          English Pop
        </button>
        
        <div className="hidden md:flex ml-auto items-center gap-2 text-[10px] font-bold text-[#a3a3a3] uppercase tracking-widest bg-[#f0f0f0] dark:bg-[#1a1a1a] px-4 py-2 rounded-full">
          <TrendingUp className="w-3 h-3 text-green-500" />
          Live Trending
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 bg-[#f9f9f9] dark:bg-[#111111] rounded-3xl border border-dashed border-[#e5e5e5] dark:border-[#2a2a2a]">
          <Music2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Oops! Couldn't load music.</h2>
          <p className="text-[#a3a3a3]">Please check your connection or try again later.</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#a3a3a3]">No songs found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-12">
          {displayedVideos.map((video: any) => (
            <Link 
              key={video._id} 
              href={`/videos/${video._id}`}
              className="group relative flex flex-col gap-4"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#e5e5e5] dark:bg-[#2a2a2a] shadow-md group-hover:shadow-xl transition-all duration-300">
                <Image
                  src={video.content.thumbnailUrl}
                  alt={video.content.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized={true}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/30 scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-tighter">
                  Music
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1.5 px-1">
                <h3 className="font-bold text-base text-[#0a0a0a] dark:text-[#fafafa] line-clamp-2 leading-tight group-hover:text-pink-500 transition-colors">
                  {video.content.title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-pink-500/10 flex items-center justify-center">
                    <Music2 className="w-3 h-3 text-pink-500" />
                  </div>
                  <p className="text-sm text-[#737373] dark:text-[#a3a3a3] font-medium truncate">
                    {video.userId.username}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-[#a3a3a3] uppercase tracking-tighter">
                  <span>{(video.stats.views / 1000).toFixed(1)}K Views</span>
                  <span className="w-1 h-1 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
                  <span>Trending</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More */}
      {!isLoading && visibleCount < filteredVideos.length && (
        <div className="flex justify-center mt-20">
          <Button 
            variant="secondary" 
            className="rounded-2xl px-12 h-14 font-bold text-base hover:scale-105 transition-transform"
            onClick={() => setVisibleCount(prev => prev + 12)}
          >
            Load More Hits
          </Button>
        </div>
      )}
    </div>
  );
}
