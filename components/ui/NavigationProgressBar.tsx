'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetLabel, setTargetLabel] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = (label?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);

    setTargetLabel(label || '');
    setVisible(true);
    setProgress(25);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 90;
        }
        const step = Math.max(1, (90 - prev) * 0.18);
        return Math.min(90, prev + step);
      });
    }, 80);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    finishTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
      setTargetLabel('');
    }, 220);
  };

  // Route change completion listener
  useEffect(() => {
    completeProgress();
  }, [pathname]);

  // Global event listener for immediate click reactions
  useEffect(() => {
    const handleNavStart = (e: Event) => {
      const customEvent = e as CustomEvent<{ href: string; label?: string }>;
      startProgress(customEvent.detail?.label);
    };

    const handleNavComplete = () => {
      completeProgress();
    };

    window.addEventListener('circuit-nav-start', handleNavStart);
    window.addEventListener('circuit-nav-complete', handleNavComplete);

    return () => {
      window.removeEventListener('circuit-nav-start', handleNavStart);
      window.removeEventListener('circuit-nav-complete', handleNavComplete);
      if (timerRef.current) clearInterval(timerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <>
      {/* Top Glowing Progress Line */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-1 bg-transparent overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-400 transition-all duration-150 ease-out relative"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 14px 2px rgba(56, 189, 248, 0.7), 0 0 6px 1px rgba(99, 102, 241, 0.5)',
          }}
        >
          {/* Glowing Lead Head */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white opacity-90 animate-pulse" />
        </div>
      </div>

      {/* Floating Tactical Telemetry Indicator */}
      {progress > 30 && progress < 100 && (
        <div className="fixed top-3 right-6 z-50 pointer-events-none animate-fade-in flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-sky-500/40 text-sky-300 text-xs font-mono shadow-2xl backdrop-blur-md">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400 shrink-0" />
          <span>{targetLabel ? `Routing to ${targetLabel}...` : 'Loading Intelligence Node...'}</span>
        </div>
      )}
    </>
  );
}
