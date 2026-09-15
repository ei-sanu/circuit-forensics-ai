'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Sparkles, Filter, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface TopbarProps {
  onSearch?: (query: string) => void;
  activeCase?: string;
  onCaseChange?: (caseId: string) => void;
}

export function Topbar({ onSearch, activeCase, onCaseChange }: TopbarProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (pathname === '/' || pathname === '/login') return null;

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Laptop className="w-3.5 h-3.5 text-blue-500" />;
    if (theme === 'dark') return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    return <Sun className="w-3.5 h-3.5 text-amber-500" />;
  };

  return (
    <header className="h-16 border-b border-neutral-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0d121d]/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search entities, aliases, phone numbers, vehicle plates..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="w-full pl-10 pr-10 py-2 bg-neutral-100/80 dark:bg-slate-900/90 border border-neutral-200 dark:border-slate-800 rounded-full text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all"
          />
          <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 text-neutral-400 dark:text-neutral-500">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Theme Quick Toggle */}
        <button
          onClick={cycleTheme}
          title={`Current theme: ${theme} (Click to toggle)`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-neutral-50 dark:hover:bg-slate-800 border border-neutral-200 dark:border-slate-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-xs transition cursor-pointer"
        >
          {getThemeIcon()}
          <span className="capitalize text-[11px] font-medium hidden sm:inline">{theme}</span>
        </button>

        {/* Live Map Quick Link */}
        <Link
          href="/locations"
          prefetch={true}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-neutral-50 dark:hover:bg-slate-800 border border-neutral-200 dark:border-slate-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold shadow-xs transition"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Map</span>
        </Link>

        {/* Live ML Connected Chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 dark:bg-blue-950/60 border border-neutral-800 dark:border-blue-800/40 text-white text-xs font-medium shadow-xs">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="text-[11px]">Graph Engine Online</span>
        </div>
      </div>
    </header>
  );
}
