'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Home, Search, Film, Music2, User } from 'lucide-react';
import Image from 'next/image';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navLinks = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/reels', icon: Film, label: 'Reels' },
    { href: '/music', icon: Music2, label: 'Music' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-t border-[#e5e5e5] dark:border-[#2a2a2a] pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-12">
        {navLinks.map(({ href, icon: Icon }) => {
          const profileHref = href === '/profile' ? `/profile/${user?.username}` : href;
          const isActive = profileHref === pathname || (href === '/feed' && pathname === '/');

          if (href === '/profile') {
            return (
              <Link key={href} href={profileHref} className="flex-1 flex justify-center py-2">
                <div className={`w-6 h-6 rounded-full overflow-hidden border ${isActive ? 'border-[#0a0a0a] dark:border-[#fafafa]' : 'border-transparent'}`}>
                  {user?.profileImage ? (
                    <Image src={user.profileImage} alt="Profile" width={24} height={24} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex justify-center py-2 transition-transform active:scale-90 ${
                isActive ? 'text-[#0a0a0a] dark:text-[#fafafa]' : 'text-[#737373] dark:text-[#a3a3a3]'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
