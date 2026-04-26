'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Rss, User, Settings, LogOut, Film } from 'lucide-react';
import Image from 'next/image';

const navLinks = [
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/reels', label: 'Reels', icon: Film },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/feed"
          className="text-base font-bold tracking-tight text-[#0a0a0a] dark:text-[#fafafa] hover:opacity-70 transition-opacity"
        >
          TG FUN HUB
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
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
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-[#fafafa]'
                    : 'text-[#525252] dark:text-[#a3a3a3] hover:bg-[#f9f9f9] dark:hover:bg-[#111111] hover:text-[#0a0a0a] dark:hover:text-[#fafafa]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle compact />

          {/* Avatar dropdown trigger */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href={`/profile/${user?.username}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a] overflow-hidden flex items-center justify-center">
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
              className="btn-ghost p-2 rounded-md"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
