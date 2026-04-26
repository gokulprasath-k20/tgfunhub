'use client';

import { useState, useRef, useEffect } from 'react';
import { useMessages, useConversations } from '@/hooks/useChat';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/authStore';
import { useCall } from '@/providers/CallProvider';
import type { IMessage, IChatUser } from '@/types/chat';
import { Button } from '@/components/ui/Button';
import { Send, ArrowLeft, Phone, Video } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

interface ActiveChatProps {
  conversationId: string;
  onBack: () => void;
}

export function ActiveChat({ conversationId, onBack }: ActiveChatProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useMessages(conversationId);
  const { data: conversations } = useConversations();
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const { callUser } = useCall();
  const qc = useQueryClient();

  const [inputText, setInputText] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversation = conversations?.find((c) => c._id === conversationId);
  const otherParticipant = conversation?.participants.find(
    (p) => (p as IChatUser)._id !== user?.id
  ) as IChatUser | undefined;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.pages, optimisticMessages]);

  // Listen for real-time messages via socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join room
    socket.emit('join_conversation', conversationId);

    const handleNewMessage = (newMessage: IMessage) => {
      // Append strictly if it's for the current conversation
      if (newMessage.conversationId === conversationId) {
        setOptimisticMessages((prev) => [...prev, newMessage]);
      }
      
      // We should also invalidate queries slightly later to keep standard REST cache in sync
      qc.invalidateQueries({ queryKey: ['conversations'] });

      // Mark read if chat is open
      if (newMessage.senderId !== user?.id) {
        socket.emit('mark_read', { conversationId, userId: user?.id, messageId: newMessage._id });
      }
    };

    const handleTyping = (data: { conversationId: string, userId: string }) => {
      if (data.conversationId === conversationId && data.userId === otherParticipant?._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data: { conversationId: string, userId: string }) => {
      if (data.conversationId === conversationId && data.userId === otherParticipant?._id) {
        setIsTyping(false);
      }
    };

    const handleStatus = (data: { userId: string, status: string }) => {
      if (data.userId === otherParticipant?._id) {
        setIsOnline(data.status === 'online');
      }
    };

    const handleMessageRead = (data: { conversationId: string, messageId: string, userId: string }) => {
      if (data.conversationId === conversationId) {
        setOptimisticMessages(prev => prev.map(msg => {
          if (msg._id === data.messageId && !msg.readBy.includes(data.userId)) {
            return { ...msg, readBy: [...msg.readBy, data.userId] };
          }
          return msg;
        }));
        // We could also invalidate the query here, but optimistic update is smoother
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('user_status', handleStatus);
    socket.on('message_read', handleMessageRead);

    // Check initial status
    if (otherParticipant) {
      socket.emit('check_status', otherParticipant._id);
    }

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      socket.off('user_status', handleStatus);
      socket.off('message_read', handleMessageRead);
      socket.emit('leave_conversation', conversationId);
    };
  }, [socket, isConnected, conversationId, qc, otherParticipant?._id, user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (socket && user) {
      socket.emit('typing', { conversationId, userId: user.id });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId, userId: user.id });
      }, 2000);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !user) return;

    const payload = {
      conversationId,
      senderId: user.id,
      text: inputText.trim(),
    };

    // Optimistic UI for my own message
    const tempMsg: IMessage = {
      _id: `temp-${Date.now()}`,
      conversationId,
      senderId: user.id, // For temp display
      text: inputText.trim(),
      readBy: [user.id],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setOptimisticMessages((prev) => [...prev, tempMsg]);
    setInputText('');

    // Emit to server for real-time broadcast to others
    socket.emit('send_message', payload);

    // Save to database via REST
    fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText.trim() }),
    }).catch(err => console.error('Failed to save message', err));
  };

  if (status === 'pending') {
    return <div className="h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#0a0a0a] dark:border-[#fafafa] border-t-transparent rounded-full animate-spin" /></div>;
  }

  // Combine API messages and optimistic real-time messages
  // Pages are fetched newest first. We need to reverse them to display chronologically from top to bottom
  const apiMessages = data?.pages.flatMap((page) => page.messages).reverse() || [];
  const allMessages = [...apiMessages, ...optimisticMessages];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
        <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="w-10 h-10 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a] overflow-hidden flex-shrink-0 flex items-center justify-center relative">
          {otherParticipant?.profileImage ? (
            <Image
              src={otherParticipant.profileImage}
              alt={otherParticipant.username}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-[#525252] dark:text-[#a3a3a3]">
              {otherParticipant?.username?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <div className="font-semibold text-[#0a0a0a] dark:text-[#fafafa] flex items-center gap-2">
            {otherParticipant?.username ?? 'Chat'}
            {isOnline && (
              <span className="w-2 h-2 rounded-full bg-green-500 mt-0.5" title="Online" />
            )}
          </div>
          {isTyping && (
            <span className="text-xs text-[#525252] dark:text-[#a3a3a3] animate-pulse">
              typing...
            </span>
          )}
        </div>
        
        <div className="flex-1" />
        
        {/* Call Buttons */}
        <button
          onClick={() => otherParticipant && callUser(otherParticipant._id, false)}
          className="p-2 text-[#525252] hover:text-[#0a0a0a] dark:text-[#a3a3a3] dark:hover:text-[#fafafa] bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-full transition-colors"
          title="Voice Call"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={() => otherParticipant && callUser(otherParticipant._id, true)}
          className="p-2 text-[#525252] hover:text-[#0a0a0a] dark:text-[#a3a3a3] dark:hover:text-[#fafafa] bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-full transition-colors ml-2"
          title="Video Call"
        >
          <Video className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-xs font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#0a0a0a] dark:hover:text-[#fafafa]"
            >
              {isFetchingNextPage ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {allMessages.map((msg, index) => {
          const isMe = 
            typeof msg.senderId === 'string' 
              ? msg.senderId === user?.id 
              : (msg.senderId as IChatUser)._id === user?.id;

          const showAvatar = !isMe && (index === 0 || typeof allMessages[index - 1].senderId === 'string' ? allMessages[index - 1].senderId !== msg.senderId : (allMessages[index - 1].senderId as IChatUser)._id !== (msg.senderId as IChatUser)._id);

          return (
            <div
              key={msg._id}
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex gap-2 max-w-[70%]">
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a] overflow-hidden flex-shrink-0 flex items-center justify-center mt-auto">
                    {showAvatar && otherParticipant?.profileImage ? (
                      <Image
                        src={otherParticipant.profileImage}
                        alt="Avatar"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : showAvatar ? (
                      <span className="text-xs font-semibold text-[#525252] dark:text-[#a3a3a3]">
                        {otherParticipant?.username?.[0]?.toUpperCase()}
                      </span>
                    ) : null}
                  </div>
                )}
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isMe
                        ? 'bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black rounded-br-sm'
                        : 'bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-[#fafafa] rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-[#a3a3a3]">
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </span>
                    {isMe && msg.readBy && msg.readBy.length > 1 && (
                      <span className="text-[10px] text-blue-500 font-medium ml-1">· Read</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Message..."
            className="flex-1 h-10 px-4 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] border-none focus:ring-1 focus:ring-[#0a0a0a] dark:focus:ring-[#fafafa] text-sm text-[#0a0a0a] dark:text-[#fafafa]"
          />
          <Button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full p-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
