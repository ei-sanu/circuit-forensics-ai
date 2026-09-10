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
  Shield,
  UserPlus,
  Compass,
  Network,
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
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-4">
      <nav className="w-full max-w-6xl h-16 rounded-full bg-white/80 border border-beige-300/80 shadow-xl shadow-charcoal-900/5 backdrop-blur-2xl px-5 sm:px-6 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-charcoal-900 flex items-center justify-center text-beige-200 font-bold shadow-sm group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-beige-300" />
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

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-charcoal-600">
          <a href="#capabilities" className="hover:text-charcoal-950 transition-colors">
            Capabilities
          </a>
          <a href="#how-it-works" className="hover:text-charcoal-950 transition-colors">
            Architecture
          </a>
          <a href="#roles" className="hover:text-charcoal-950 transition-colors">
            Role Consoles
          </a>
          <a href="#security" className="hover:text-charcoal-950 transition-colors">
            Security & Trust
          </a>
          <Link href="/explorer" className="hover:text-charcoal-950 transition-colors flex items-center gap-1">
            <Network className="w-3.5 h-3.5 text-sky-600" />
            <span>Neural Graph</span>
          </Link>
        </div>

        {/* Right Dynamic Auth State Controls */}
        <div className="flex items-center gap-2.5 text-xs font-semibold">
          {user ? (
            /* Logged In State */
            <div className="flex items-center gap-2.5">
              {/* User Profile Pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal-950/5 border border-beige-300/80">
                <div className="w-6 h-6 rounded-full bg-charcoal-900 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name ? user.name[0].toUpperCase() : <User className="w-3 h-3" />}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-charcoal-950 leading-tight truncate max-w-[110px]">
                    {user.name || user.email}
                  </p>
                  <p className="text-[9px] font-mono text-charcoal-500 uppercase tracking-tight">
                    {getRoleLabel()}
                  </p>
                </div>
              </div>

              {/* Go to Dashboard Button */}
              <Link
                href={getDashboardHref()}
                className="px-4 py-2 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold shadow-md shadow-charcoal-900/15 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-beige-300" />
                <span>Dashboard</span>
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                title="Sign Out of Session"
                className="p-2 rounded-full text-charcoal-600 hover:text-red-600 hover:bg-red-50 transition cursor-pointer border border-transparent hover:border-red-200"
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
                className="text-charcoal-700 hover:text-charcoal-950 transition-colors px-3 py-1.5 rounded-full hover:bg-beige-200/60 font-semibold cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth?.('investigator')}
                className="px-4 py-2 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold shadow-md shadow-charcoal-900/15 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-3.5 h-3.5 text-beige-300" />
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
