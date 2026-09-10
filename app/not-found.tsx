'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Compass,
  ArrowLeft,
  LayoutDashboard,
  Network,
  Users,
  Briefcase,
  Search,
  Crosshair,
  MapPin,
  Home,
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-between p-4 sm:p-6 text-charcoal-900 select-none">
      {/* Top Brand Bar */}
      <header className="w-full max-w-5xl py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-charcoal-900 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wider text-charcoal-900 block leading-tight">
              CIRCUIT<span className="text-charcoal-500 font-normal italic ml-0.5">AI</span>
            </span>
            <span className="text-[9px] font-mono text-charcoal-500 block uppercase tracking-tighter">
              Law Enforcement Intelligence
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 hover:bg-slate-50 transition shadow-sm"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* Central Holographic Tactical Card */}
      <div className="max-w-2xl w-full glass-panel rounded-3xl p-6 sm:p-10 text-center shadow-2xl border-2 border-beige-300/40 relative overflow-hidden space-y-6 my-auto animate-scale-in">
        {/* Radar & Cyber Grid Background Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 30%, rgba(14, 165, 233, 0.15) 0%, transparent 70%),
              linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 30px 30px, 30px 30px',
          }}
        />

        {/* Tactical Error Telemetry Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-700 font-mono text-[11px] font-bold shadow-sm">
          <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
          <span>TELEMETRY FAULT // 404 UNRESOLVED COORDINATES</span>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        </div>

        {/* Big Glitch 404 Title */}
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-8xl font-black font-mono tracking-tighter text-charcoal-950">
            4<span className="text-red-600">0</span>4
          </h1>
          <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900">
            Investigative Case Not Found
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed">
            The evidential link, case coordinate, or intelligence record you requested does not exist in the active master database.
          </p>
        </div>

        {/* Quick Tactical Navigation Grid */}
        <div className="pt-2 border-t border-slate-200">
          <p className="text-[10px] font-mono uppercase tracking-widest text-charcoal-500 font-bold mb-3">
            Authorized Return Vectors
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-semibold">
            <Link
              href="/dashboard"
              className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-charcoal-900 hover:bg-slate-50 transition flex items-center justify-center gap-2 text-charcoal-800 shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-600" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/explorer"
              className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-charcoal-900 hover:bg-slate-50 transition flex items-center justify-center gap-2 text-charcoal-800 shadow-sm"
            >
              <Network className="w-4 h-4 text-emerald-600" />
              <span>Explorer</span>
            </Link>

            <Link
              href="/cases"
              className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-charcoal-900 hover:bg-slate-50 transition flex items-center justify-center gap-2 text-charcoal-800 shadow-sm"
            >
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>Case Files</span>
            </Link>

            <Link
              href="/fir-track"
              className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-charcoal-900 hover:bg-slate-50 transition flex items-center justify-center gap-2 text-charcoal-800 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>FIR Tracker</span>
            </Link>

            <Link
              href="/locations"
              className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-charcoal-900 hover:bg-slate-50 transition flex items-center justify-center gap-2 text-charcoal-800 shadow-sm"
            >
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>Geo Map</span>
            </Link>

            <Link
              href="/police"
              className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-charcoal-900 hover:bg-slate-50 transition flex items-center justify-center gap-2 text-charcoal-800 shadow-sm"
            >
              <Compass className="w-4 h-4 text-cyan-600" />
              <span>Police Portal</span>
            </Link>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-charcoal-950 hover:bg-charcoal-800 text-white font-bold text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Command Dashboard</span>
          </Link>
          <Link
            href="/explorer"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-slate-200 hover:border-charcoal-900 text-charcoal-900 font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4 text-charcoal-600" />
            <span>Search Knowledge Graph</span>
          </Link>
        </div>
      </div>

      {/* Footer Note */}
      <footer className="w-full max-w-5xl py-4 text-center text-xs text-charcoal-500">
        © 2026 CIRCUIT AI Intelligence Platform. All unauthorized access attempts are logged.
      </footer>
    </div>
  );
}
