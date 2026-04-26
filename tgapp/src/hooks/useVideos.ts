'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IPostWithMeta, PostsResponse } from '@/types/post';

export function useVideos() {
  return useInfiniteQuery({
    queryKey: ['videos'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set('cursor', pageParam as string);
      
      const res = await fetch(`/api/videos?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json() as Promise<PostsResponse>;
    },
    getNextPageParam: (last: PostsResponse) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; text?: string; videoUrl: string; thumbnailUrl?: string }) => {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish video');
      }
      return res.json() as Promise<{ video: IPostWithMeta }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] });
      // Invalidate user profile since they posted a new video
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${id}`);
      if (!res.ok) throw new Error('Failed to fetch video');
      const data = await res.json();
      return data.video as IPostWithMeta;
    },
    enabled: !!id,
  });
}
