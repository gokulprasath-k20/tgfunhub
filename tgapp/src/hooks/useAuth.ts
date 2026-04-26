'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, isLoading, setUser, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      return data.user;
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Swallow network errors
    }
    storeLogout();
    router.push('/login');
    toast.success('Logged out');
  }, [storeLogout, router]);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!res.ok) {
        storeLogout();
      }
    } catch {
      storeLogout();
    }
  }, [storeLogout]);

  return { user, isLoading, login, logout, refreshAuth };
}
