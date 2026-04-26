'use client';

import { useConversations } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import type { IConversation, IChatUser, IMessage } from '@/types/chat';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';

interface ConversationListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ activeId, onSelect }: ConversationListProps) {
  const { data: conversations, isLoading, error } = useConversations();
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 w-full animate-pulse">
            <div className="w-12 h-12 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded w-1/2" />
              <div className="h-3 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !conversations) {
    return (
      <div className="p-4 text-sm text-[#a3a3a3]">
        Failed to load conversations.
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
          <MessageSquare className="w-5 h-5 text-[#a3a3a3]" />
        </div>
        <p className="text-[#0a0a0a] dark:text-[#fafafa] font-medium mb-1">No messages</p>
        <p className="text-sm text-[#a3a3a3]">When you chat with someone, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto h-full">
      {conversations.map((conv) => {
        // Find the other participant in a 1-on-1 chat
        const otherParticipant = conv.participants.find(
          (p) => (p as IChatUser)._id !== user?.id
        ) as IChatUser | undefined;

        const displayName = conv.isGroup ? conv.groupName : otherParticipant?.username;
        const displayImage = conv.isGroup ? null : otherParticipant?.profileImage;

        const lastMessage = conv.lastMessage as IMessage | undefined;

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={`flex items-center gap-3 p-4 text-left transition-colors border-b border-[#e5e5e5] dark:border-[#2a2a2a] hover:bg-[#f9f9f9] dark:hover:bg-[#111111] ${
              activeId === conv._id ? 'bg-[#f0f0f0] dark:bg-[#1a1a1a]' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a] overflow-hidden flex-shrink-0 flex items-center justify-center">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={displayName ?? 'User'}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-[#525252] dark:text-[#a3a3a3]">
                  {displayName?.[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-[#0a0a0a] dark:text-[#fafafa] truncate">
                  {displayName}
                </h4>
                {lastMessage && (
                  <span className="text-[10px] text-[#a3a3a3] whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#525252] dark:text-[#a3a3a3] truncate">
                {lastMessage ? lastMessage.text : 'No messages yet'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
