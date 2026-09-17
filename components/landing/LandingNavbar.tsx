'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ArrowRight,
  User,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { getCurrentUser, removeAuthToken, AuthUser } from '@/lib/auth';

interface LandingNavbarProps {
  onOpenAuth?: (role?: 'investigator' | 'analyst' | 'admin' | 'police_station' | 'hr') => void;
}

export function LandingNavbar({ onOpenAuth }: LandingNavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    router.push('/');
  };

  const getDashboardHref = () => {
    if (!user) return '/login';
    if (user.role === 'police_station') return '/police';
    if (user.role === 'hr') return '/hr';
    return '/dashboard';
  };

  const getRoleLabel = () => {
    if (!user) return '';
    switch (user.role) {
      case 'police_station':
        return user.stationName || 'Police Station';
      case 'hr':
        return 'HR Directorate';
      case 'admin':
        return 'System Admin';
      case 'analyst':
        return 'Financial Analyst';
      case 'investigator':
      default:
        return 'Investigator';
    }
  };

  return (
    <div className="fixed top-8 sm:top-9 left-0 right-0 z-40 flex justify-center px-4 pt-2">
      <nav className="w-full max-w-6xl h-16 rounded-full bg-[#0c1222]/90 border border-slate-800/90 shadow-2xl shadow-black/60 backdrop-blur-2xl px-5 sm:px-6 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-600/30 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wider text-white block leading-tight">
              CIRCUIT<span className="text-sky-400 font-normal italic ml-0.5">2.0</span>
            </span>
            <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-tighter">
              Govt. of India • LEA Portal
            </span>
          </div>
        </Link>

        {/* Right Dynamic Auth State Controls */}
        <div className="flex items-center gap-2.5 text-xs font-semibold">
          {user ? (
            /* Logged In State */
            <div className="flex items-center gap-2.5">
              {/* User Profile Pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80">
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  {user.name ? user.name[0].toUpperCase() : <User className="w-3 h-3" />}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white leading-tight truncate max-w-[110px]">
                    {user.name || user.email}
                  </p>
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tight">
                    {getRoleLabel()}
                  </p>
                </div>
              </div>

              {/* Go to Dashboard Button */}
              <Link
                href={getDashboardHref()}
                className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md shadow-sky-600/25 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                <span>Dashboard</span>
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                title="Sign Out of Session"
                className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Logged Out State */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth?.('investigator')}
                className="text-slate-300 hover:text-white transition-colors px-3.5 py-1.5 rounded-full hover:bg-slate-800/80 font-semibold cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth?.('investigator')}
                className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md shadow-sky-600/25 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
