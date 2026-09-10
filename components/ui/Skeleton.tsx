'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
  dark?: boolean;
}

export function Skeleton({
  className,
  shimmer = true,
  dark = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all',
        dark
          ? shimmer
            ? 'skeleton-shimmer-dark'
            : 'bg-slate-800/60 animate-pulse'
          : shimmer
          ? 'skeleton-shimmer'
          : 'bg-beige-200/80 animate-pulse',
        className
      )}
      {...props}
    />
  );
}

// ----------------------------------------------------------------------------
// Dashboard Skeleton
// ----------------------------------------------------------------------------
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 text-charcoal-900 animate-fade-in">
      {/* Role Banner Skeleton */}
      <div className="p-6 rounded-3xl glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-48 h-6 rounded-lg" />
              <Skeleton className="w-20 h-5 rounded-full" />
            </div>
            <Skeleton className="w-72 h-4 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-24 h-9 rounded-full" />
          <Skeleton className="w-24 h-9 rounded-full" />
          <Skeleton className="w-24 h-9 rounded-full" />
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-3xl glass-card space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <Skeleton className="w-24 h-3.5 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <Skeleton className="w-20 h-8 rounded-lg" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="w-12 h-4 rounded-full" />
              <Skeleton className="w-28 h-3 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Visual / Charts & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity / Anomaly Feed */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="w-44 h-5 rounded-md" />
              <Skeleton className="w-64 h-3.5 rounded-md" />
            </div>
            <Skeleton className="w-24 h-8 rounded-full" />
          </div>
          <div className="space-y-3 pt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/70 border border-beige-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="w-36 h-4 rounded-md" />
                    <Skeleton className="w-56 h-3 rounded-md" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="w-16 h-4 rounded-full ml-auto" />
                  <Skeleton className="w-12 h-3 rounded-md ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Intelligence Dossier / Telemetry */}
        <div className="p-6 rounded-3xl glass-panel space-y-5 shadow-xl">
          <div className="space-y-1.5">
            <Skeleton className="w-36 h-5 rounded-md" />
            <Skeleton className="w-48 h-3.5 rounded-md" />
          </div>
          <div className="p-4 rounded-2xl bg-white/70 border border-beige-200 space-y-4">
            <Skeleton className="w-full h-32 rounded-xl" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="w-24 h-3.5 rounded-md" />
                <Skeleton className="w-12 h-3.5 rounded-md" />
              </div>
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="w-28 h-3.5 rounded-md" />
                <Skeleton className="w-12 h-3.5 rounded-md" />
              </div>
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Cases Skeleton
// ----------------------------------------------------------------------------
export function CasesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-3xl glass-card space-y-4 flex flex-col justify-between shadow-md"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="w-28 h-6 rounded-full" />
              <Skeleton className="w-20 h-5 rounded-full" />
            </div>
            <Skeleton className="w-3/4 h-5 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="w-full h-3.5 rounded-md" />
              <Skeleton className="w-5/6 h-3.5 rounded-md" />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-beige-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-6 h-6 rounded-full" />
              </div>
              <Skeleton className="w-20 h-4 rounded-md" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-16 h-4 rounded-full" />
              <Skeleton className="w-20 h-4 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Entities Skeleton
// ----------------------------------------------------------------------------
export function EntitiesSkeleton() {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-xl animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-beige-300 bg-white/60 text-charcoal-600 font-mono font-bold">
              <th className="p-4"><Skeleton className="w-28 h-4 rounded" /></th>
              <th className="p-4"><Skeleton className="w-20 h-4 rounded" /></th>
              <th className="p-4"><Skeleton className="w-16 h-4 rounded" /></th>
              <th className="p-4"><Skeleton className="w-32 h-4 rounded" /></th>
              <th className="p-4"><Skeleton className="w-24 h-4 rounded" /></th>
              <th className="p-4"><Skeleton className="w-24 h-4 rounded" /></th>
              <th className="p-4 text-right"><Skeleton className="w-16 h-4 rounded ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-200">
            {[...Array(6)].map((_, i) => (
              <tr key={i} className="p-4">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-2xl shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="w-32 h-4 rounded-md" />
                      <Skeleton className="w-20 h-3 rounded-md" />
                    </div>
                  </div>
                </td>
                <td className="p-4"><Skeleton className="w-24 h-4 rounded-md" /></td>
                <td className="p-4"><Skeleton className="w-16 h-5 rounded-full" /></td>
                <td className="p-4"><Skeleton className="w-36 h-4 rounded-md" /></td>
                <td className="p-4">
                  <div className="space-y-1">
                    <Skeleton className="w-16 h-3 rounded-md" />
                    <Skeleton className="w-24 h-2 rounded-full" />
                  </div>
                </td>
                <td className="p-4"><Skeleton className="w-20 h-5 rounded-full" /></td>
                <td className="p-4 text-right"><Skeleton className="w-16 h-6 rounded-full ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// FIR Track Skeleton
// ----------------------------------------------------------------------------
export function FirTrackSkeleton() {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-xl animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-beige-300 bg-white/60 text-charcoal-600 font-mono font-bold">
              <th className="p-4"><Skeleton className="w-32 h-4 rounded" /></th>
              <th className="p-4"><Skeleton className="w-28 h-4 rounded" /></th>
              <th className="p-4"><Skeleton className="w-36 h-4 rounded" /></th>
              <th className="p-4"><Skeleton className="w-24 h-4 rounded" /></th>
              <th className="p-4"><Skeleton className="w-20 h-4 rounded" /></th>
              <th className="p-4 text-right"><Skeleton className="w-24 h-4 rounded ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-200">
            {[...Array(6)].map((_, i) => (
              <tr key={i} className="p-4">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-2xl shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="w-28 h-4 rounded-md" />
                      <Skeleton className="w-36 h-3 rounded-md" />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1.5">
                    <Skeleton className="w-24 h-4 rounded-md" />
                    <Skeleton className="w-16 h-3 rounded-md" />
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-1.5">
                    <Skeleton className="w-16 h-5 rounded-full" />
                    <Skeleton className="w-14 h-5 rounded-full" />
                  </div>
                </td>
                <td className="p-4"><Skeleton className="w-20 h-5 rounded-full" /></td>
                <td className="p-4"><Skeleton className="w-16 h-5 rounded-full" /></td>
                <td className="p-4 text-right"><Skeleton className="w-20 h-6 rounded-full ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Alerts Skeleton
// ----------------------------------------------------------------------------
export function AlertsSkeleton() {
  return (
    <div className="space-y-3 animate-fade-in">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-3xl glass-card space-y-2.5 shadow-sm border border-beige-200"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-20 h-5 rounded-full" />
            <Skeleton className="w-16 h-4 rounded-md" />
          </div>
          <Skeleton className="w-3/4 h-4 rounded-md" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="w-24 h-3.5 rounded-md" />
            <Skeleton className="w-20 h-3.5 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Graph Canvas Skeleton
// ----------------------------------------------------------------------------
export function GraphSkeleton() {
  return (
    <div className="w-full h-full bg-[#0b0f19] rounded-3xl border border-sky-500/20 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* Background simulated matrix grid lines */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#38bdf8 1px, #0b0f19 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      {/* Floating Toolbar Skeleton */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <Skeleton dark className="w-28 h-8 rounded-full" />
          <Skeleton dark className="w-24 h-8 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton dark className="w-8 h-8 rounded-full" />
          <Skeleton dark className="w-8 h-8 rounded-full" />
          <Skeleton dark className="w-24 h-8 rounded-full" />
        </div>
      </div>

      {/* Central Simulated Node Cluster with Shimmer */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 max-w-sm text-center">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-500/30 animate-spin" style={{ animationDuration: '14s' }} />
          <div className="absolute inset-2 rounded-full border border-sky-400/20" />
          <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-400/40 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-sky-400 animate-pulse shadow-lg shadow-sky-400/50" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-xs font-bold text-sky-300 tracking-wider">
            SYNTHESIZING INTELLIGENCE TOPOLOGY...
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Calculating NetworkX centrality, Louvain clustering, and dynamic relational physics
          </p>
        </div>

        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-sky-500/30">
          <div className="w-1/2 h-full bg-sky-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Bottom HUD Skeleton */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <Skeleton dark className="w-36 h-6 rounded-full" />
        <Skeleton dark className="w-44 h-6 rounded-full" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Copilot Thinking Skeleton
// ----------------------------------------------------------------------------
export function CopilotThinkingSkeleton() {
  return (
    <div className="flex gap-3 text-left animate-fade-in p-2">
      <div className="w-8 h-8 rounded-2xl bg-charcoal-900 text-beige-200 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
        <span className="animate-pulse">AI</span>
      </div>
      <div className="p-4 rounded-3xl bg-white border border-beige-300 space-y-2.5 shadow-md max-w-xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-charcoal-900 animate-pulse" />
          <span className="text-[11px] font-mono text-charcoal-600 font-bold">
            Synthesizing connected multi-source evidence...
          </span>
        </div>
        <div className="space-y-1.5 pt-1">
          <Skeleton className="w-72 h-3.5 rounded-md" />
          <Skeleton className="w-96 h-3.5 rounded-md" />
          <Skeleton className="w-48 h-3.5 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Documents List Skeleton
// ----------------------------------------------------------------------------
export function DocumentsListSkeleton() {
  return (
    <div className="space-y-2 animate-fade-in">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="p-3.5 rounded-2xl bg-white/80 border border-beige-300 flex items-center justify-between"
        >
          <div className="space-y-1.5">
            <Skeleton className="w-36 h-4 rounded-md" />
            <Skeleton className="w-24 h-3 rounded-md" />
          </div>
          <Skeleton className="w-20 h-5 rounded-full" />
        </div>
      ))}
    </div>
  );
}
