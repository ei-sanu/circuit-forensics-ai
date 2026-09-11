'use client';

import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in text-charcoal-900">
      {/* Tactical Radar / Sonar Pulse Graphic */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-6">
        {/* Outer Rotating Dashed Ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-dashed border-sky-500/40 animate-spin"
          style={{ animationDuration: '8s' }}
        />
        {/* Mid Pulse Ring */}
        <div className="absolute inset-3 rounded-full border border-sky-400/30 animate-ping" style={{ animationDuration: '2.5s' }} />
        {/* Inner Glowing Core */}
        <div className="w-14 h-14 rounded-2xl bg-charcoal-900 border border-slate-700 flex items-center justify-center text-white shadow-xl shadow-sky-500/10">
          <Shield className="w-7 h-7 text-sky-400 animate-pulse" />
        </div>
      </div>

      {/* Typography & Telemetry */}
      <div className="text-center space-y-2 max-w-md">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-500 animate-spin" style={{ animationDuration: '3s' }} />
          <h3 className="text-sm font-extrabold tracking-widest uppercase text-charcoal-900 font-mono">
            Synchronizing Workspace...
          </h3>
        </div>
        <p className="text-xs text-charcoal-500 leading-relaxed">
          Retrieving connected-entity graph indices, forensic ledgers, and telemetry records.
        </p>
      </div>

      {/* Smooth Shimmering Progress Track */}
      <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-6 relative shadow-inner">
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-400 rounded-full animate-pulse" />
      </div>

      {/* Background Micro Wireframe Placeholders */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 opacity-35 pointer-events-none">
        <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="w-20 h-4 bg-slate-200 rounded-md skeleton-shimmer" />
          <div className="w-full h-8 bg-slate-200 rounded-lg skeleton-shimmer" />
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="w-24 h-4 bg-slate-200 rounded-md skeleton-shimmer" />
          <div className="w-full h-8 bg-slate-200 rounded-lg skeleton-shimmer" />
        </div>
        <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="w-28 h-4 bg-slate-200 rounded-md skeleton-shimmer" />
          <div className="w-full h-8 bg-slate-200 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
