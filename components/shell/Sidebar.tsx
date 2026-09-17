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
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Radio,
  Sliders,
  FolderGit2,
  Radar,
  BrainCircuit,
  FileStack,
} from 'lucide-react';
import { getCurrentUser, removeAuthToken, AuthUser } from '@/lib/auth';
import { api } from '@/lib/api';

interface NavSubItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavSubItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [openAlertsCount, setOpenAlertsCount] = useState<number>(0);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Collapsible categories state (Default: General and Active category open)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    general: true,
    investigation: true,
    surveillance: false,
    ai: true,
    system: false,
  });

  // Clear pending state when navigation completes
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

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

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
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

  // Structured Categorized Navigation
  const navCategories: NavCategory[] = useMemo(() => {
    const role = user?.role;

    if (role === 'hr') {
      return [
        {
          id: 'general',
          label: 'General',
          icon: LayoutDashboard,
          items: [
            { label: 'HR Onboarding', href: '/hr', icon: UserPlus },
            { label: 'Staff Directory', href: '/hr', icon: Users },
          ],
        },
        {
          id: 'system',
          label: 'System',
          icon: Settings,
          items: [
            { label: 'Settings', href: '/settings', icon: Settings },
          ],
        },
      ];
    }

    if (role === 'police_station') {
      return [
        {
          id: 'general',
          label: 'Station Operations',
          icon: Shield,
          items: [
            { label: 'Station Dashboard', href: '/police', icon: Shield },
            { label: 'File Official FIR', href: '/police', icon: FileText },
            { label: 'Alerts', href: '/alerts', icon: ShieldAlert, badge: openAlertsCount > 0 ? openAlertsCount : undefined },
          ],
        },
        {
          id: 'investigation',
          label: 'Case Intelligence',
          icon: FolderGit2,
          items: [
            { label: 'FIR Track & Registry', href: '/fir-track', icon: FileCheck },
            { label: 'Jurisdiction Map', href: '/locations', icon: Compass },
            { label: 'Vehicle Intel', href: '/vehicles', icon: Car },
          ],
        },
        {
          id: 'system',
          label: 'System & Security',
          icon: Settings,
          items: [
            { label: 'Settings', href: '/settings', icon: Settings },
          ],
        },
      ];
    }

    if (role === 'analyst') {
      return [
        {
          id: 'general',
          label: 'General',
          icon: LayoutDashboard,
          items: [
            { label: 'Analyst Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Alerts & Anomalies', href: '/alerts', icon: ShieldAlert, badge: openAlertsCount > 0 ? openAlertsCount : undefined },
          ],
        },
        {
          id: 'forensics',
          label: 'Financial & Telecom Intel',
          icon: Landmark,
          items: [
            { label: 'Transactions & Hawala', href: '/transactions', icon: Landmark },
            { label: 'Communications CDR', href: '/communications', icon: Phone },
            { label: 'Geo Intelligence', href: '/locations', icon: MapPin },
            { label: 'Vehicle Intel', href: '/vehicles', icon: Car },
          ],
        },
        {
          id: 'ai',
          label: 'Graph & Analytics',
          icon: BrainCircuit,
          items: [
            { label: 'Intelligence Lab', href: '/intelligence-lab', icon: Sparkles },
            { label: 'Network Explorer', href: '/explorer', icon: Network },
            { label: 'AI Copilot', href: '/copilot', icon: Bot },
          ],
        },
        {
          id: 'system',
          label: 'Reporting & Dossiers',
          icon: FileStack,
          items: [
            { label: 'Reports & Dossiers', href: '/reports', icon: FileSpreadsheet },
            { label: 'System Architecture', href: '/architecture', icon: Layers },
            { label: 'Settings', href: '/settings', icon: Settings },
          ],
        },
      ];
    }

    if (role === 'investigator') {
      return [
        {
          id: 'general',
          label: 'General',
          icon: LayoutDashboard,
          items: [
            { label: 'Investigator Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Threat Alerts', href: '/alerts', icon: ShieldAlert, badge: openAlertsCount > 0 ? openAlertsCount : undefined },
          ],
        },
        {
          id: 'investigation',
          label: 'Case Operations',
          icon: FolderGit2,
          items: [
            { label: 'Active Cases', href: '/cases', icon: Briefcase },
            { label: 'Entity Registry', href: '/entities', icon: Users },
            { label: 'FIR Track & Registry', href: '/fir-track', icon: FileCheck },
            { label: 'Network Explorer', href: '/explorer', icon: Network },
          ],
        },
        {
          id: 'ai',
          label: 'AI & Forensic Copilot',
          icon: BrainCircuit,
          items: [
            { label: 'AI Copilot', href: '/copilot', icon: Bot },
            { label: 'Intelligence Lab', href: '/intelligence-lab', icon: Sparkles },
          ],
        },
        {
          id: 'surveillance',
          label: 'Field Surveillance',
          icon: Radar,
          items: [
            { label: 'Jurisdiction Map', href: '/locations', icon: MapPin },
            { label: 'Vehicle Intel', href: '/vehicles', icon: Car },
            { label: 'Communications CDR', href: '/communications', icon: Phone },
          ],
        },
        {
          id: 'system',
          label: 'Evidence & Reports',
          icon: FileStack,
          items: [
            { label: 'Court Dossiers', href: '/reports', icon: FileSpreadsheet },
            { label: 'System Architecture', href: '/architecture', icon: Layers },
            { label: 'Settings', href: '/settings', icon: Settings },
          ],
        },
      ];
    }


    // Default: Admin (Full Complete System Authority)
    const categories: NavCategory[] = [
      {
        id: 'general',
        label: 'General',
        icon: LayoutDashboard,
        items: [
          { label: 'Admin Command Console', href: '/dashboard', icon: LayoutDashboard },
          { label: 'All Alerts & Threats', href: '/alerts', icon: ShieldAlert, badge: openAlertsCount > 0 ? openAlertsCount : undefined },
        ],
      },
      {
        id: 'investigation',
        label: 'Investigation & Cases',
        icon: FolderGit2,
        items: [
          { label: 'Active Cases', href: '/cases', icon: Briefcase },
          { label: 'Entity Registry', href: '/entities', icon: Users },
          { label: 'FIR Track & Registry', href: '/fir-track', icon: FileCheck },
          { label: 'Network Explorer', href: '/explorer', icon: Network },
        ],
      },
      {
        id: 'surveillance',
        label: 'Financial & Geo Intel',
        icon: Radar,
        items: [
          { label: 'Transactions & Hawala', href: '/transactions', icon: Landmark },
          { label: 'Communications CDR', href: '/communications', icon: Phone },
          { label: 'Geo Intelligence', href: '/locations', icon: MapPin },
          { label: 'Vehicle Intel', href: '/vehicles', icon: Car },
        ],
      },
      {
        id: 'ai',
        label: 'AI & Anomaly Labs',
        icon: BrainCircuit,
        items: [
          { label: 'AI Copilot', href: '/copilot', icon: Bot },
          { label: 'Intelligence Lab', href: '/intelligence-lab', icon: Sparkles },
        ],
      },
      {
        id: 'system',
        label: 'System Administration',
        icon: FileStack,
        items: [
          { label: 'Reports & Dossiers', href: '/reports', icon: FileSpreadsheet },
          { label: 'System Architecture', href: '/architecture', icon: Layers },
          { label: 'HR User Approvals', href: '/settings?tab=users', icon: UserPlus },
          { label: 'System Settings', href: '/settings', icon: Settings },
        ],
      },
    ];

    return categories;
  }, [user, openAlertsCount]);

  // Auto-expand category if active page belongs to it
  useEffect(() => {
    navCategories.forEach((cat) => {
      const hasActive = cat.items.some(
        (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
      );
      if (hasActive && !expandedGroups[cat.id]) {
        setExpandedGroups((prev) => ({ ...prev, [cat.id]: true }));
      }
    });
  }, [pathname, navCategories]);

  if (pathname === '/' || pathname === '/login') return null;

  return (
    <aside className="w-64 bg-[#f8f9fa] border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-2xl text-slate-800 z-30 overflow-y-auto transition-colors duration-200 select-none">
      <div>
        {/* Top Header with "< Back" Button and Brand */}
        <div className="p-4 border-b border-slate-200/80 space-y-3">
          {/* Sleek < Back Pill Button */}
          <button
            onClick={handleBack}
            className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-800 text-xs font-semibold shadow-xs hover:bg-slate-100 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Brand Logo & Title */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group pt-1">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-black tracking-tight flex items-center">
                CIRCUIT<span className="text-blue-600 font-semibold italic ml-0.5">2.0</span>
              </h1>
              <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">
                Intelligence Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Structured Categorized Navigation */}
        <nav className="p-3 space-y-2">
          {navCategories.map((category) => {
            const CatIcon = category.icon;
            const isExpanded = expandedGroups[category.id] ?? true;

            return (
              <div key={category.id} className="space-y-0.5">
                {/* Category Accordion Header */}
                <button
                  onClick={() => toggleGroup(category.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/40 dark:hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CatIcon className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                    <span>{category.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                </button>

                {/* Sub-Items List */}
                {isExpanded && (
                  <div className="space-y-0.5 pt-0.5 pl-1">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isPending = pendingHref === item.href;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) ||
                        (pathname === '/settings' && item.href === '/settings');

                      return (
                        <Link
                          key={item.label + item.href}
                          href={item.href}
                          prefetch={true}
                          onClick={() => handleNavClick(item.href, item.label)}
                          className={`group flex items-center justify-between px-3 py-2 rounded-2xl text-xs transition-all duration-150 relative active:scale-[0.98] ${
                            isActive
                              ? 'bg-white text-black shadow-xs border border-slate-200 font-semibold'
                              : isPending
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse font-medium'
                              : 'text-slate-600 hover:text-black hover:bg-slate-200/50 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isPending ? (
                              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                            ) : (
                              <Icon
                                className={`w-3.5 h-3.5 transition-transform duration-150 group-hover:scale-110 shrink-0 ${
                                  isActive
                                    ? 'text-blue-600'
                                    : 'text-slate-400 group-hover:text-slate-700'
                                }`}
                              />
                            )}
                            <span className="truncate">{item.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isPending && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                            )}
                            {item.badge !== undefined && (
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                  isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-red-500 text-white shadow-xs'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80">
        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shadow-xs shrink-0">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'CO'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-black truncate">
                {user?.name || 'Command Officer'}
              </p>
              <p className="text-[9px] text-slate-500 uppercase font-mono">
                {user?.role?.replace('_', ' ') || 'Investigator'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
