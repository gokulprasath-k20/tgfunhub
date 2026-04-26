'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minus, Maximize2, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatBot() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hey ${user?.username || 'there'}! I'm your TG Hub assistant. How can I help you today?` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!res.ok) throw new Error('Failed to get AI response');
      
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the network right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ease-in-out ${
        isMinimized 
          ? 'bottom-8 right-8 w-64 h-14' 
          : 'bottom-20 right-6 md:bottom-8 md:right-8 w-[calc(100vw-3rem)] md:w-96 h-[500px] max-h-[calc(100vh-10rem)]'
      } bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-3xl shadow-2xl flex flex-col overflow-hidden`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-between bg-[#fcfcfc] dark:bg-[#0f0f0f]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0a0a0a] dark:text-[#fafafa]">TG Assistant</h3>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-[#a3a3a3] font-medium uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] rounded-full transition-colors text-[#a3a3a3]"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] rounded-full transition-colors text-[#a3a3a3]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-hide">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black rounded-br-none' 
                      : 'bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-[#fafafa] rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#f0f0f0] dark:bg-[#1a1a1a] px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#a3a3a3] rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[#a3a3a3] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-[#a3a3a3] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 bg-[#fcfcfc] dark:bg-[#0f0f0f] border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="w-full bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] dark:focus:ring-[#fafafa] transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black rounded-xl disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-center text-[#a3a3a3] mt-3 font-medium uppercase tracking-widest">
              Powered by Google Gemini
            </p>
          </div>
        </>
      )}
    </div>
  );
}
