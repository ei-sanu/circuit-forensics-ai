'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Network,
  MapPin,
  Briefcase,
  Users,
  FileText,
  AlertTriangle,
  Bot,
  ShieldAlert,
  LogOut,
  Shield,
  Landmark,
  Phone,
  FileSpreadsheet,
  Settings,
  FileCheck,
  UserPlus,
  Compass,
  Car,
  Sparkles,
  Layers,
  Loader2,
} from 'lucide-react';
import { getCurrentUser, removeAuthToken, AuthUser } from '@/lib/auth';
import { api } from '@/lib/api';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [openAlertsCount, setOpenAlertsCount] = useState<number>(0);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending state when navigation completes
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const handleNavClick = (href: string, label: string) => {
    if (pathname !== href) {
      setPendingHref(href);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('circuit-nav-start', { detail: { href, label } })
        );
      }
    }
  };

  useEffect(() => {
    setUser(getCurrentUser());

    const fetchLiveAlertsCount = async () => {
      try {
        const alerts = await api.getAlerts();
        if (alerts && Array.isArray(alerts)) {
          const count = alerts.filter((a) => a.status === 'open').length;
          setOpenAlertsCount(count);
        }
      } catch {
        // Fallback
      }
    };

    fetchLiveAlertsCount();

    // Listen to live FIR match events to refresh count immediately
    const handleLiveAlert = () => {
      fetchLiveAlertsCount();
    };

    window.addEventListener('fir-uploaded-match', handleLiveAlert);
    const interval = setInterval(fetchLiveAlertsCount, 10000);

    return () => {
      window.removeEventListener('fir-uploaded-match', handleLiveAlert);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    router.push('/');
  };

  const navItems = useMemo(() => {
    const role = user?.role;

    if (role === 'hr') {
      return [
        { label: 'HR Onboarding', href: '/hr', icon: UserPlus },
        { label: 'Staff Directory', href: '/hr', icon: Users },
        { label: 'Settings', href: '/settings', icon: Settings },
      ];
    }

    if (role === 'police_station') {
      return [
        { label: 'Station Dashboard', href: '/police', icon: Shield },
        { label: 'File Official FIR', href: '/police', icon: FileText },
        { label: 'FIR Track & Registry', href: '/fir-track', icon: FileCheck },
        { label: 'Jurisdiction Map', href: '/locations', icon: Compass },
        { label: 'Vehicle Intel', href: '/vehicles', icon: Car },
        { label: 'Alerts', href: '/alerts', icon: ShieldAlert, badge: openAlertsCount > 0 ? openAlertsCount : undefined },
        { label: 'Settings', href: '/settings', icon: Settings },
      ];
    }

    // Default: Admin, Investigator, Analyst
    const items = [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Network Explorer', href: '/explorer', icon: Network },
      { label: 'Entities', href: '/entities', icon: Users },
      { label: 'FIR Track', href: '/fir-track', icon: FileCheck },
      { label: 'Investigations', href: '/cases', icon: Briefcase },
      { label: 'Alerts', href: '/alerts', icon: ShieldAlert, badge: openAlertsCount > 0 ? openAlertsCount : undefined },
      { label: 'Transactions', href: '/transactions', icon: Landmark },
      { label: 'Communications', href: '/communications', icon: Phone },
      { label: 'Vehicle Intel', href: '/vehicles', icon: Car },
      { label: 'Geo Intelligence', href: '/locations', icon: MapPin },
      { label: 'AI Intelligence Lab', href: '/intelligence-lab', icon: Sparkles },
      { label: 'AI Copilot', href: '/copilot', icon: Bot },
      { label: 'Reports', href: '/reports', icon: FileSpreadsheet },
      { label: 'Settings', href: '/settings', icon: Settings },
    ];

    if (role === 'admin') {
      items.splice(items.length - 1, 0, { label: 'HR Onboarding', href: '/hr', icon: UserPlus });
    }

    return items;
  }, [user, openAlertsCount]);

  if (pathname === '/' || pathname === '/login') return null;

  return (
    <aside className="w-64 bg-charcoal-950/95 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-2xl text-slate-100 z-30 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <Link href="/" className="p-4 border-b border-slate-800 flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-600/30 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-wider">
              CIRCUIT<span className="text-sky-400 font-normal italic ml-0.5">AI</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-mono tracking-tight uppercase">Network Intelligence</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="p-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isPending = pendingHref === item.href;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label + item.href}
                href={item.href}
                prefetch={true}
                onClick={() => handleNavClick(item.href, item.label)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 relative active:scale-[0.98] ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                    : isPending
                    ? 'bg-sky-950/80 text-sky-200 border border-sky-500/50 shadow-sm animate-pulse'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isPending ? (
                    <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                  ) : (
                    <Icon
                      className={`w-4 h-4 transition-transform duration-150 group-hover:scale-110 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isPending && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white text-sky-700' : 'bg-red-500 text-white shadow-sm'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Synthetic Demo Disclaimer */}
      <div className="p-3 border-t border-slate-800 bg-charcoal-900/70 space-y-2">
        {/* Demo Disclaimer */}
        <div className="p-2 rounded-xl bg-charcoal-950 border border-amber-500/20 text-[9px] text-amber-300/80 font-mono leading-tight">
          <strong className="text-amber-200 uppercase">SYNTHETIC DEMO:</strong> All data is fictional. Indicators are not proof of guilt.
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-1.5 rounded-xl bg-charcoal-950/60 border border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center text-[11px] font-extrabold shrink-0">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'IM'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-100 truncate">{user?.name || 'Lead Officer'}</p>
              <p className="text-[9px] text-slate-400 uppercase font-mono">{user?.role?.replace('_', ' ') || 'Investigator'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
