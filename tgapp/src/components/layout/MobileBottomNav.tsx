'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Rss, User, Settings, Film, MessageSquare, ShoppingBag } from 'lucide-react';

const navLinks = [
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/reels', label: 'Reels', icon: Film },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-t border-[#e5e5e5] dark:border-[#2a2a2a]"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const profileHref = href === '/profile' ? `/profile/${user?.username}` : href;
          const isActive =
            href === '/profile'
              ? pathname.startsWith('/profile')
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={profileHref}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-[#0a0a0a] dark:text-[#fafafa]'
                  : 'text-[#a3a3a3] dark:text-[#525252]'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-150 ${
                  isActive ? 'scale-110' : ''
                }`}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
