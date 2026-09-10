'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  X,
  ExternalLink,
  Volume2,
  VolumeX,
  Radio,
  Building,
  ArrowRight,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { audioAlert } from '@/lib/audioAlert';
import { api } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export function MatchAlertSpace() {
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const sessionStartTime = useRef<number>(Date.now());
  const knownAlertIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const user = getCurrentUser();
    setUserRole(user?.role || '');

    // Initial baseline sync: memorize existing alerts so we DO NOT popup old alerts on page load
    const initializeAlertBaseline = async () => {
      try {
        const initialAlerts = await api.getAlerts();
        if (initialAlerts && Array.isArray(initialAlerts)) {
          initialAlerts.forEach((a) => {
            if (a.alertId) knownAlertIds.current.add(a.alertId);
          });
        }
      } catch {
        // Fallback
      }
    };

    initializeAlertBaseline();

    // 1. Direct Real-Time Event Listener when an actual FIR is uploaded / lodged in the app
    const handleLiveFirMatch = (event: CustomEvent) => {
      const matchDetail = event.detail;
      if (matchDetail) {
        setActiveMatch(matchDetail);
        audioAlert.playCriticalMatchAlert();
      }
    };

    window.addEventListener('fir-uploaded-match' as any, handleLiveFirMatch as any);

    // 2. Background check: Only triggers if a NEW alert arrives that was NOT in the initial baseline
    const checkNewIncomingAlerts = async () => {
      try {
        const alerts = await api.getAlerts();
        if (alerts && Array.isArray(alerts)) {
          const brandNewAlert = alerts.find((a) => {
            const isUnseen = !knownAlertIds.current.has(a.alertId);
            const isCritical = a.severity === 'critical' && a.status === 'open';
            const alertTime = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
            return isUnseen && isCritical && alertTime >= sessionStartTime.current - 5000;
          });

          if (brandNewAlert) {
            knownAlertIds.current.add(brandNewAlert.alertId);
            setActiveMatch(brandNewAlert);
            audioAlert.playCriticalMatchAlert();
          }
        }
      } catch {
        // Fallback
      }
    };

    const interval = setInterval(checkNewIncomingAlerts, 10000);

    return () => {
      window.removeEventListener('fir-uploaded-match' as any, handleLiveFirMatch as any);
      clearInterval(interval);
    };
  }, []);

  // Only show alert space for admin, investigator, analyst
  if (!activeMatch || userRole === 'hr') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slide-in select-none">
      <div className="p-5 rounded-3xl bg-charcoal-950/95 border-2 border-red-500/80 text-white shadow-2xl backdrop-blur-2xl space-y-3 shadow-red-500/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-500/20 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/40 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-extrabold flex items-center gap-1">
                <Radio className="w-3 h-3 animate-ping" />
                <span>NEW LIVE MATCH DISPATCHED</span>
              </span>
              <h4 className="font-extrabold text-sm text-white font-mono leading-tight">
                {activeMatch.title || '🚨 CRITICAL SUSPECT MATCH IDENTIFIED'}
              </h4>
            </div>
          </div>
          <button
            onClick={() => setActiveMatch(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {activeMatch.explanation ||
            'Accused suspect identified in newly filed Police Station FIR matches master syndicate criminal records. Immediate tactical coordination advised.'}
        </p>

        {/* Matched Entities & Station */}
        {activeMatch.entities && activeMatch.entities.length > 0 && (
          <div className="p-2.5 rounded-2xl bg-charcoal-900/90 border border-red-500/20 text-xs font-mono space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Matched Target(s):</span>
            <div className="flex flex-wrap gap-1.5">
              {activeMatch.entities.map((e: any) => (
                <span
                  key={e.id || e.label}
                  className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-[11px]"
                >
                  {e.label || e.id} ({e.type || 'person'})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-red-500/20 text-xs">
          <div className="flex items-center gap-2">
            <Link
              href="/fir-track"
              onClick={() => setActiveMatch(null)}
              className="px-3 py-1.5 rounded-full bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition"
            >
              <span>View FIR</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/explorer"
              onClick={() => setActiveMatch(null)}
              className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-red-600/30 transition"
            >
              <span>Investigate Graph</span>
              <Crosshair className="w-3 h-3" />
            </Link>
          </div>

          <button
            onClick={() => setActiveMatch(null)}
            className="text-[11px] text-slate-400 hover:text-white font-mono transition cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
