'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Rss, User, Settings, LogOut, Film, MessageSquare, PlaySquare, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

const navLinks = [
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/reels', label: 'Reels', icon: Film },
  { href: '/videos', label: 'Videos', icon: PlaySquare },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#e5e5e5] dark:border-[#2a2a2a] h-[calc(100vh-56px)] sticky top-14 p-4 gap-1">
      {/* Profile snippet */}
      <Link
        href={`/profile/${user?.username}`}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f9f9f9] dark:hover:bg-[#111111] transition-colors mb-2"
      >
        <div className="w-9 h-9 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a] overflow-hidden flex-shrink-0 flex items-center justify-center">
          {user?.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.username ?? ''}
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-sm font-semibold text-[#525252] dark:text-[#a3a3a3]">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0a0a0a] dark:text-[#fafafa] truncate">
            {user?.username}
          </p>
          <p className="text-xs text-[#a3a3a3] truncate">{user?.email}</p>
        </div>
      </Link>

      <div className="h-px bg-[#e5e5e5] dark:bg-[#2a2a2a] mb-2" />

      {/* Nav links */}
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-[#fafafa]'
                : 'text-[#525252] dark:text-[#a3a3a3] hover:bg-[#f9f9f9] dark:hover:bg-[#111111] hover:text-[#0a0a0a] dark:hover:text-[#fafafa]'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        );
      })}

      <Link
        href={`/profile/${user?.username}`}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          pathname.startsWith('/profile')
            ? 'bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-[#fafafa]'
            : 'text-[#525252] dark:text-[#a3a3a3] hover:bg-[#f9f9f9] dark:hover:bg-[#111111] hover:text-[#0a0a0a] dark:hover:text-[#fafafa]'
        }`}
      >
        <User className="w-4 h-4 flex-shrink-0" />
        Profile
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      <div className="h-px bg-[#e5e5e5] dark:bg-[#2a2a2a] mb-2" />

      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#a3a3a3] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-150 w-full text-left"
      >
        <LogOut className="w-4 h-4 flex-shrink-0" />
        Logout
      </button>
    </aside>
  );
}
