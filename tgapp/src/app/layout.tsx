import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/shared/Providers';

export const metadata: Metadata = {
  title: {
    default: 'TG FUN HUB',
    template: '%s | TG FUN HUB',
  },
  description: 'A clean, minimal social platform for sharing moments and connecting with people.',
  keywords: ['social media', 'tg fun hub', 'posts', 'community'],
  openGraph: {
    title: 'TG FUN HUB',
    description: 'A clean, minimal social platform.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const s = localStorage.getItem('theme-storage');
                const t = s ? JSON.parse(s).state?.theme : 'system';
                const d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme:dark)').matches);
                if (d) document.documentElement.classList.add('dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-[#0a0a0a] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
