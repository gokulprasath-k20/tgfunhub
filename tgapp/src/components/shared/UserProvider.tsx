'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePathname } from 'next/navigation';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    // Only fetch if we are in a dashboard route and don't have user data
    const isPublic = ['/login', '/register', '/forgot-password', '/reset-password'].some(p => pathname.startsWith(p));
    
    if (!isPublic && !user) {
      setLoading(true);
      fetch('/api/users/profile')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        })
        .catch(() => {
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, setUser, setLoading, pathname]);

  return <>{children}</>;
}
