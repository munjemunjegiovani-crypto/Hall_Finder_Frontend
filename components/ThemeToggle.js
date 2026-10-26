'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/Providers';

export default function ThemeToggle({ className = '', onDark = false }) {
  const { resolved, setTheme } = useTheme();
  const dark = resolved === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition ${onDark ? 'border-white/25 bg-white/10 text-white hover:bg-white/20' : 'border-line bg-surface text-ink hover:bg-surface2'} ${className}`}
    >
      {dark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
