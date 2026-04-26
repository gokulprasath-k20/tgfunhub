'use client';

import { useState, Suspense } from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { ActiveChat } from '@/components/chat/ActiveChat';
import { MessageSquare } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

function MessagesContent() {
  const searchParams = useSearchParams();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(searchParams.get('id'));

  return (
    <div className="flex h-[calc(100vh-112px)] md:h-[calc(100vh-56px)] bg-white dark:bg-[#0a0a0a]">
      {/* Sidebar List - Hidden on mobile if a chat is active */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-[#e5e5e5] dark:border-[#2a2a2a] ${
          activeConversationId ? 'hidden md:block' : 'block'
        }`}
      >
        <div className="p-4 border-b border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#0a0a0a] dark:text-[#fafafa]">Messages</h1>
        </div>
        <div className="h-[calc(100%-61px)]">
          <ConversationList
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`flex-1 ${
          !activeConversationId ? 'hidden md:flex' : 'flex'
        } flex-col`}
      >
        {activeConversationId ? (
          <ActiveChat
            key={activeConversationId} // Remount component on chat change
            conversationId={activeConversationId}
            onBack={() => setActiveConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-[#a3a3a3]" />
            </div>
            <h2 className="text-xl font-semibold text-[#0a0a0a] dark:text-[#fafafa] mb-2">
              Your Messages
            </h2>
            <p className="text-[#525252] dark:text-[#a3a3a3] max-w-sm">
              Send private photos and messages to a friend. Start a conversation from their profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-56px)]">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
