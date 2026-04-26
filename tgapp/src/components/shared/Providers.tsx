'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,   // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeInitializer() {
  const { theme, setTheme } = useThemeStore();
  useEffect(() => {
    setTheme(theme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-raised)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: 'var(--shadow-md)',
            padding: '12px 16px',
          },
        }}
      />
    </QueryClientProvider>
  );
}
