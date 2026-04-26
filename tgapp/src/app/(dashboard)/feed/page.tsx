'use client';
import type { Variants } from 'framer-motion';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { motion } from 'framer-motion';
import { usePosts } from '@/hooks/usePosts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostCard } from '@/components/feed/PostCard';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';
import { Loader } from '@/components/shared/Loader';
import type { IPostWithMeta } from '@/types/post';
import type { Metadata } from 'next';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function FeedPage() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = usePosts();

  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const id = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, []);

  const sentinelRef = useInfiniteScroll(
    () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); },
    !!hasNextPage,
    isFetchingNextPage
  );

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <motion.div initial="hidden" animate="show" variants={fadeUp}>
        <CreatePost />
      </motion.div>

      {isLoading && <FeedSkeleton count={4} />}

      {!isLoading && posts.length === 0 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="card p-12 text-center"
        >
          <p className="text-[#525252] dark:text-[#a3a3a3] text-sm">
            No posts yet. Create the first one!
          </p>
        </motion.div>
      )}

      {!isLoading && posts.length > 0 && (
        <div className="border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg overflow-hidden divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a]">
          {posts.map((post: IPostWithMeta, i: number) => (
            <motion.div
              key={post._id}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" aria-hidden="true" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader size="sm" />
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-xs text-[#a3a3a3] dark:text-[#525252] py-4">
          You&apos;re all caught up ✓
        </p>
      )}
    </div>
  );
}
