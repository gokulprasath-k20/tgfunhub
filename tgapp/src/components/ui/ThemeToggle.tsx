'use client';

import { useThemeStore } from '@/store/themeStore';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const options: { value: Theme; icon: React.FC<{ className?: string }>; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark', icon: Moon, label: 'Dark' },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useThemeStore();

  if (compact) {
    const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
    const next: Theme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    return (
      <button
        onClick={() => setTheme(next)}
        className="btn-ghost p-2 rounded-md"
        aria-label={`Switch to ${next} theme`}
        title={`Current: ${theme}`}
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div
      className="inline-flex items-center rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] p-0.5 gap-0.5"
      role="radiogroup"
      aria-label="Theme preference"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
            theme === value
              ? 'bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-[#0a0a0a]'
              : 'text-[#525252] dark:text-[#a3a3a3] hover:text-[#0a0a0a] dark:hover:text-[#fafafa]'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
