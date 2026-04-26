'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IPostWithMeta, PostsResponse } from '@/types/post';
import toast from 'react-hot-toast';

async function fetchPosts({
  pageParam,
  username,
}: {
  pageParam?: string;
  username?: string;
}): Promise<PostsResponse> {
  const params = new URLSearchParams();
  if (pageParam) params.set('cursor', pageParam);
  if (username) params.set('username', username);

  const res = await fetch(`/api/posts?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export function usePosts(username?: string) {
  return useInfiniteQuery({
    queryKey: ['posts', username],
    queryFn: ({ pageParam }) =>
      fetchPosts({ pageParam: pageParam as string | undefined, username }),
    getNextPageParam: (last: PostsResponse) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: { text: string; images?: string[] }) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create post');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete post');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted');
    },
    onError: () => toast.error('Failed to delete post'),
  });
}

export function useToggleLike(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to toggle like');
      return res.json() as Promise<{ liked: boolean; likesCount: number }>;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['posts'] });
      const prev = qc.getQueriesData({ queryKey: ['posts'] });

      qc.setQueriesData(
        { queryKey: ['posts'] },
        (old: { pages: { posts: IPostWithMeta[] }[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p._id === postId
                  ? {
                      ...p,
                      isLiked: !p.isLiked,
                      stats: {
                        ...p.stats,
                        likes: p.isLiked ? p.stats.likes - 1 : p.stats.likes + 1,
                      },
                    }
                  : p
              ),
            })),
          };
        }
      );

      qc.setQueriesData(
        { queryKey: ['reels'] },
        (old: { pages: { posts: IPostWithMeta[] }[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p._id === postId
                  ? {
                      ...p,
                      isLiked: !p.isLiked,
                      stats: {
                        ...p.stats,
                        likes: p.isLiked ? p.stats.likes - 1 : p.stats.likes + 1,
                      },
                    }
                  : p
              ),
            })),
          };
        }
      );

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        context.prev.forEach(([key, data]) => qc.setQueryData(key, data));
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['reels'] });
    },
  });
}
