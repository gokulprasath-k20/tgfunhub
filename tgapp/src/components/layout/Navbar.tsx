'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Modal } from '@/components/ui/Modal';
import { CreatePost } from '@/components/feed/CreatePost';
import { 
  Rss, 
  User, 
  Settings, 
  LogOut, 
  Film, 
  Music2, 
  MessageSquare, 
  Heart,
  Search,
  PlusSquare,
  ShoppingBag
} from 'lucide-react';
import Image from 'next/image';

const navLinks = [
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/reels', label: 'Reels', icon: Film },
  { href: '/music', label: 'Music', icon: Music2 },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo - Instagram Style */}
        <Link
          href="/feed"
          className="text-xl font-black italic tracking-tighter text-[#0a0a0a] dark:text-[#fafafa] hover:opacity-70 transition-opacity"
        >
          FUNHUB
        </Link>

        {/* Desktop Nav - Middle */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-[#fafafa]'
                    : 'text-[#525252] dark:text-[#a3a3a3] hover:bg-[#f9f9f9] dark:hover:bg-[#111111] hover:text-[#0a0a0a] dark:hover:text-[#fafafa]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1.5 md:gap-3">
          <ThemeToggle compact />
          
          <button 
            onClick={() => setIsCreatePostOpen(true)}
            className="p-2 hover:bg-[#f9f9f9] dark:hover:bg-[#111111] rounded-full transition-colors"
            aria-label="Create Post"
          >
            <PlusSquare className="w-6 h-6 stroke-[1.5px]" />
          </button>
          
          <Link 
            href="/shop"
            className="p-2 hover:bg-[#f9f9f9] dark:hover:bg-[#111111] rounded-full transition-colors"
          >
            <ShoppingBag className="w-6 h-6 stroke-[1.5px]" />
          </Link>
          
          <Link 
            href="/activity"
            className="p-2 hover:bg-[#f9f9f9] dark:hover:bg-[#111111] rounded-full transition-colors"
          >
            <Heart className="w-6 h-6 stroke-[1.5px]" />
          </Link>
          
          <Link 
            href="/messages"
            className="p-2 hover:bg-[#f9f9f9] dark:hover:bg-[#111111] rounded-full transition-colors relative"
          >
            <MessageSquare className="w-6 h-6 stroke-[1.5px]" />
          </Link>

          {/* Desktop User Dropdown */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href={`/profile/${user?.username}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full border border-[#e5e5e5] dark:border-[#2a2a2a] overflow-hidden bg-[#e5e5e5] dark:bg-[#2a2a2a] flex items-center justify-center">
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={user.username}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xs font-semibold text-[#525252] dark:text-[#a3a3a3]">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </Link>

            <button
              onClick={logout}
              className="p-2 hover:bg-[#f9f9f9] dark:hover:bg-[#111111] rounded-full transition-colors text-red-500"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} title="Create Post" size="md">
        <CreatePost onPostCreated={() => setIsCreatePostOpen(false)} />
      </Modal>
    </header>
  );
}
