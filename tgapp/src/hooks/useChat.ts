'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IConversation, MessagesResponse } from '@/types/chat';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/conversations');
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      return data.conversations as IConversation[];
    },
  });
}

export function useMessages(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set('cursor', pageParam as string);
      
      const res = await fetch(`/api/conversations/${conversationId}/messages?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json() as Promise<MessagesResponse>;
    },
    getNextPageParam: (last: MessagesResponse) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId,
  });
}

export function useStartConversation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to start conversation');
      }
      return res.json() as Promise<{ conversation: IConversation }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
