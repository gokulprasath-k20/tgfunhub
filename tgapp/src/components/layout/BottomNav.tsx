'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Film, Music2, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navLinks = [
    { href: '/feed', icon: Home, label: 'Home' },
    { href: '/music', icon: Search, label: 'Search' }, // Using Search icon for discovery/music
    { href: '/reels', icon: Film, label: 'Reels' },
    { href: '/music', icon: Music2, label: 'Music' },
    { href: `/profile/${user?.username}`, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#0a0a0a] border-t border-[#e5e5e5] dark:border-[#262626] flex items-center justify-around px-2 z-50 pb-safe">
      {navLinks.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors ${
              isActive ? 'text-[#0a0a0a] dark:text-[#fafafa]' : 'text-[#737373] dark:text-[#a3a3a3]'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
          </Link>
        );
      })}
    </nav>
  );
}
