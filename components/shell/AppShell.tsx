'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MatchAlertSpace } from '../notifications/MatchAlertSpace';

const VALID_DASHBOARD_ROUTES = [
  '/dashboard',
  '/explorer',
  '/entities',
  '/fir-track',
  '/cases',
  '/alerts',
  '/transactions',
  '/communications',
  '/locations',
  '/vehicles',
  '/insights',
  '/intelligence-lab',
  '/documents',
  '/copilot',
  '/reports',
  '/settings',
  '/police',
  '/hr',
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isInternalDashboardRoute = VALID_DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // If on landing, login, or any unknown 404 route, render standalone without exposing internal sidebar/topbar
  if (!isInternalDashboardRoute) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen w-full bg-white text-charcoal-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
      <MatchAlertSpace />
    </div>
  );
}
