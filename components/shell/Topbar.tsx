'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Sparkles, Filter } from 'lucide-react';

interface TopbarProps {
  onSearch?: (query: string) => void;
  activeCase?: string;
  onCaseChange?: (caseId: string) => void;
}

export function Topbar({ onSearch, activeCase, onCaseChange }: TopbarProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  if (pathname === '/' || pathname === '/login') return null;

  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur-2xl px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search entities, aliases, phone numbers, vehicle plates..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-charcoal-900 shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Map Quick Link */}
        <Link
          href="/locations"
          prefetch={true}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-charcoal-800 text-xs font-bold shadow-sm transition"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Live Map</span>
        </Link>

        {/* Case Context Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs shadow-sm">
          <Filter className="w-3.5 h-3.5 text-charcoal-500" />
          <span className="text-charcoal-500">Scope:</span>
          <span className="font-bold text-charcoal-900">{activeCase || 'Operation Nightfall (CR-2026-00124)'}</span>
        </div>

        {/* Live ML Connected Chip */}
        <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-charcoal-900 text-white text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Graph Engine Online</span>
        </div>
      </div>
    </header>
  );
}
