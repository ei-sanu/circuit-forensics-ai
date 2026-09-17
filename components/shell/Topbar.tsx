'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Sun,
  Moon,
  Laptop,
  PhoneCall,
  Clock,
  Lock,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [timeStr, setTimeStr] = useState('');

  // Live Accurate Indian Standard Time (IST) Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Reliable IST: UTC + 5:30
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istDate = new Date(utc + (3600000 * 5.5));

      const dateStr = istDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timeStrFormatted = istDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setTimeStr(`${dateStr} | ${timeStrFormatted} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-xl sticky top-0 z-20 transition-colors duration-200 select-none">
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Authentic Ashoka Lion Capital Emblem & Official Bilingual GoI Typography */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {/* Ashoka Lion Capital Vector Emblem */}
            <div
              className="flex-shrink-0 w-6 h-8 flex items-center justify-center text-neutral-800 dark:text-amber-400"
              title="State Emblem of India • भारत का राजचिह्न"
            >
              <svg viewBox="0 0 64 88" fill="currentColor" className="w-full h-full drop-shadow-xs">
                {/* Central Lion Head */}
                <path d="M32 4 C27 4 23 8 23 13 C23 16 25 18 27 20 C25 21 24 23 24 26 C24 30 27 33 32 33 C37 33 40 30 40 26 C40 23 39 21 37 20 C39 18 41 16 41 13 C41 8 37 4 32 4 Z" opacity="0.95" />
                {/* Left Lion Head */}
                <path d="M19 12 C14 12 11 16 11 20 C11 23 13 25 15 27 C13 28 12 31 13 34 C14 38 18 40 22 39 C22 36 21 34 21 31 C22 28 21 26 20 24 C21 22 22 20 21 17 C21 14 20 13 19 12 Z" opacity="0.85" />
                {/* Right Lion Head */}
                <path d="M45 12 C50 12 53 16 53 20 C53 23 51 25 49 27 C51 28 52 31 51 34 C50 38 46 40 42 39 C42 36 43 34 43 31 C42 28 43 26 44 24 C43 22 42 20 43 17 C43 14 44 13 45 12 Z" opacity="0.85" />
                {/* Lion Manes & Chests */}
                <path d="M26 31 C26 31 23 38 23 44 C23 47 25 49 32 49 C39 49 41 47 41 44 C41 38 38 31 38 31 Z" />
                {/* Abacus / Base Platform */}
                <rect x="14" y="49" width="36" height="4" rx="1" />
                {/* Central Dharma Chakra (Wheel of Law) */}
                <circle cx="32" cy="59" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="32" cy="59" r="1.5" />
                <line x1="32" y1="53" x2="32" y2="65" stroke="currentColor" strokeWidth="0.75" />
                <line x1="26" y1="59" x2="38" y2="59" stroke="currentColor" strokeWidth="0.75" />
                <line x1="27.8" y1="54.8" x2="36.2" y2="63.2" stroke="currentColor" strokeWidth="0.75" />
                <line x1="27.8" y1="63.2" x2="36.2" y2="54.8" stroke="currentColor" strokeWidth="0.75" />
                {/* Bull on right, Galloping Horse on left */}
                <path d="M18 57 C16 56 15 58 15 60 C16 61 18 61 19 60 Z" opacity="0.8" />
                <path d="M46 57 C48 56 49 58 49 60 C48 61 46 61 45 60 Z" opacity="0.8" />
                {/* Lower Abacus Base */}
                <rect x="10" y="65" width="44" height="3" rx="1" />
                {/* Inverted Bell Lotus Foundation */}
                <path d="M15 68 C20 74 24 76 32 76 C40 76 44 74 49 68 Z" opacity="0.9" />
                {/* Satyameva Jayate Foundation */}
                <rect x="8" y="77" width="48" height="2" rx="0.5" opacity="0.6" />
                <path d="M12 80 C18 84 46 84 52 80 C48 83 16 83 12 80 Z" opacity="0.4" />
              </svg>
            </div>

            {/* Official Bilingual Government of India Text Hierarchy */}
            <div className="flex flex-col justify-center leading-tight">
              <div className="flex items-center gap-1.5 font-devanagari font-bold text-[12px] text-neutral-900 dark:text-neutral-100 tracking-normal">
                <span>भारत सरकार</span>
                <span className="text-neutral-300 dark:text-neutral-700 font-sans font-normal">|</span>
                <span className="font-sans font-bold text-[11px] uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Government of India
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 dark:text-neutral-400 tracking-tight">
                <span className="font-devanagari font-medium text-neutral-700 dark:text-neutral-300">गृह मंत्रालय</span>
                <span className="text-neutral-300 dark:text-neutral-700">|</span>
                <span className="font-medium">Ministry of Home Affairs</span>
                <span className="text-neutral-300 dark:text-neutral-700 hidden lg:inline">•</span>
                <span className="text-neutral-500 dark:text-neutral-400 hidden lg:inline font-mono text-[9.5px]">
                  Indian Cyber Crime Coordination Centre (I4C)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right Badges & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Statutory Portal Classification Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SECURE LEA PORTAL // CERT-IN VERIFIED</span>
          </div>

          {/* Official Helpline */}
          <div className="hidden lg:flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold text-[10.5px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
            <PhoneCall className="w-3 h-3" />
            <span>Helpline: 1930</span>
          </div>

          {/* Security Clearance Badge */}
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold font-mono text-[10px]">
            <Lock className="w-2.5 h-2.5" />
            <span>RESTRICTED // LEVEL-4 LEO</span>
          </div>

          {/* Live Accurate IST Clock */}
          {timeStr && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 text-neutral-800 dark:text-neutral-200 font-mono text-[11px] font-medium shadow-2xs">
              <Clock className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
              <span>{timeStr}</span>
            </div>
          )}

          {/* Live Copilot Link */}
          <Link
            href="/copilot"
            prefetch={true}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs transition"
          >
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span className="text-[11px]">AI Copilot</span>
          </Link>

          {/* Live Map Quick Link */}
          <Link
            href="/locations"
            prefetch={true}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 hover:bg-neutral-50 dark:hover:bg-slate-800 border border-neutral-200 dark:border-slate-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold shadow-xs transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">Live Map</span>
          </Link>

          {/* Theme Quick Toggle */}
          <button
            onClick={cycleTheme}
            title={`Current theme: ${theme} (Click to toggle)`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 hover:bg-neutral-50 dark:hover:bg-slate-800 border border-neutral-200 dark:border-slate-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-xs transition cursor-pointer"
          >
            {getThemeIcon()}
            <span className="capitalize text-[11px] font-medium hidden md:inline">{theme}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
