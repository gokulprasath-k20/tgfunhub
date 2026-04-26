'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ICommentWithMeta } from '@/types/comment';
import toast from 'react-hot-toast';

async function fetchComments(postId: string): Promise<{ comments: ICommentWithMeta[] }> {
  const res = await fetch(`/api/comments?postId=${postId}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
  });
}

export function useCreateComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: { postId: string; parentId?: string; content: string }) => {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add comment');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.postId] });
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      postId,
    }: {
      commentId: string;
      postId: string;
    }) => {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete comment');
      return { postId };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['comments', data.postId] });
      qc.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Comment deleted');
    },
    onError: () => toast.error('Failed to delete comment'),
  });
}
