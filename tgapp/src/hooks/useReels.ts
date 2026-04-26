'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IPostWithMeta, PostsResponse } from '@/types/post';
import toast from 'react-hot-toast';

async function fetchReels({
  pageParam,
}: {
  pageParam?: string;
}): Promise<PostsResponse> {
  const params = new URLSearchParams();
  if (pageParam) params.set('cursor', pageParam);

  const res = await fetch(`/api/reels?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reels');
  return res.json();
}

export function useReels() {
  return useInfiniteQuery({
    queryKey: ['reels'],
    queryFn: ({ pageParam }) => fetchReels({ pageParam: pageParam as string | undefined }),
    getNextPageParam: (last: PostsResponse) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useCreateReel() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: { text?: string; videoUrl: string }) => {
      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create reel');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Reel created!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
