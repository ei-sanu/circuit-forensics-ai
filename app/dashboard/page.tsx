'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Users,
  Network,
  AlertTriangle,
  Flame,
  Activity,
  Shield,
  Server,
  Lock,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '@/lib/api';
import { getCurrentUser, AuthUser } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import {
  MASTER_ENTITIES,
  MASTER_CASES,
  MASTER_ALERTS,
  MASTER_TRANSACTIONS,
  EntityRecord,
  AlertRecord,
} from '@/lib/data';

// 60-Day Network Activity Simulation Data
const ACTIVITY_60_DAYS = Array.from({ length: 20 }, (_, i) => {
  const day = 60 - i * 3;
  return {
    dayLabel: `${day}d ago`,
    transactions: 12 + Math.floor(Math.sin(i) * 6 + i * 1.5),
    volumeLakhs: (8.5 + Math.sin(i * 1.2) * 4 + i * 0.8).toFixed(1),
    anomalies: Math.max(1, Math.floor(Math.sin(i * 2) * 3 + 2)),
  };
}).reverse();

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setUserState] = useState<AuthUser | null>(null);
  const [activeRole, setActiveRole] = useState<'investigator' | 'analyst' | 'admin' | 'police_station' | 'hr'>('investigator');
  const [loading, setLoading] = useState(true);

  // Data states
  const [entities, setEntities] = useState<EntityRecord[]>(MASTER_ENTITIES);
  const [cases, setCases] = useState<any[]>(MASTER_CASES);
  const [alerts, setAlerts] = useState<AlertRecord[]>(MASTER_ALERTS);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [graphMetrics, setGraphMetrics] = useState<any>(null);

  // Modal inspection states
  const [selectedEntity, setSelectedEntity] = useState<EntityRecord | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);
  const [activeMetricTab, setActiveMetricTab] = useState<'transactions' | 'volumeLakhs' | 'anomalies'>('transactions');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'police_station') {
        router.replace('/police');
        return;
      }
      if (user.role === 'hr') {
        router.replace('/hr');
        return;
      }
      setUserState(user);
      setActiveRole(user.role);
    }
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ents, cs, alts, g, logs] = await Promise.all([
        api.getEntities({ limit: 12 }).catch(() => MASTER_ENTITIES),
        api.getCases({ limit: 10 }).catch(() => MASTER_CASES),
        api.getAlerts().catch(() => MASTER_ALERTS),
        api.getGraphAnalytics().catch(() => ({ analytics: { metrics: null } })),
        api.getAuditLogs().catch(() => []),
      ]);
      const entsToUse = ents && ents.length > 20 ? ents : MASTER_ENTITIES;
      const sortedEnts = [...entsToUse].sort((a, b) => (b.influenceScore || 0) - (a.influenceScore || 0));
      const casesToUse = cs && cs.length >= MASTER_CASES.length ? cs : MASTER_CASES;
      setCases(casesToUse);
      setAlerts(alts && alts.length > 0 ? alts : MASTER_ALERTS);
      setGraphMetrics(g?.analytics?.metrics || null);
      setAuditLogs(logs || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.alertId === alertId ? { ...a, status: 'dismissed' } : a)));
    if (selectedAlert?.alertId === alertId) {
      setSelectedAlert(null);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 text-charcoal-900 pb-12">
      {/* Executive Operational Header (Strictly Bound to Logged-in User Profile) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-950 text-white flex items-center justify-center font-bold shadow-md">
            {activeRole === 'admin' && <Shield className="w-6 h-6 text-slate-200" />}
            {activeRole === 'analyst' && <Activity className="w-6 h-6 text-slate-200" />}
            {activeRole === 'investigator' && <Briefcase className="w-6 h-6 text-slate-200" />}
            {activeRole === 'police_station' && <ShieldAlert className="w-6 h-6 text-slate-200" />}
            {activeRole === 'hr' && <Users className="w-6 h-6 text-slate-200" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-charcoal-950">
                {activeRole === 'admin' && 'Central Command & Intelligence Directorate'}
                {activeRole === 'analyst' && 'Financial Forensics & Anomaly Workspace'}
                {activeRole === 'investigator' && 'Investigative Operations & Case Console'}
                {activeRole === 'police_station' && 'Police Station Operational Console'}
                {activeRole === 'hr' && 'HR Directorate & Personnel Vault'}
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 uppercase font-bold">
                {currentUser?.role?.replace('_', ' ') || 'Authorized'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              {currentUser?.name ? `${currentUser.name} • ` : ''}
              {currentUser?.department || 'Cyber & Financial Crime Intelligence Division'}
              {currentUser?.badgeNumber ? ` • Badge ${currentUser.badgeNumber}` : ''}
            </p>
          </div>
        </div>

        {/* Officer Credential Badge */}
        <div className="flex items-center gap-3 text-xs font-medium self-start md:self-auto">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono">{currentUser?.stationName || 'National Cyber Cell HQ'}</span>
          </div>
          {activeRole === 'admin' && (
            <Link
              href="/settings?tab=users"
              className="px-3.5 py-1.5 rounded-2xl bg-charcoal-950 text-white text-[11px] font-semibold hover:bg-charcoal-900 transition flex items-center gap-1.5"
            >
              <span>User Governance</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Central Command Telemetry Ribbon */}
      <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-charcoal-900 to-slate-950 text-white flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shadow-sm border border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-100 tracking-wider">CIRCUIT CENTRAL COMMAND OPERATIONS</span>
          <span className="text-slate-400 hidden sm:inline">• 24/7 MULTI-CORRIDOR SYNDICATE SURVEILLANCE</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 text-[10px]">
          <span>NETWORK NODES: <strong className="text-white font-bold">{Math.max(entities.length, MASTER_ENTITIES.length)}</strong></span>
          <span className="hidden sm:inline">DATABASE HEALTH: <strong className="text-emerald-300 font-bold">100% OPERATIONAL</strong></span>
          <span className="hidden md:inline">INSPECTION NODE: <strong className="text-sky-300 font-bold">NEW DELHI HQ</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 CORE KPI CARDS (Restored, Clickable to specific modules) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/cases"
          className="p-5 rounded-3xl glass-card shadow-sm hover:shadow-md hover:border-slate-400 transition group"
        >
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold">Active Investigations</span>
            <Briefcase className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-black text-charcoal-950 mt-2">{cases.length}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+2 filed this week (DNS 318, 61)</span>
          </div>
        </Link>

        <Link
          href="/entities"
          className="p-5 rounded-3xl glass-card shadow-sm hover:shadow-md hover:border-slate-400 transition group"
        >
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold">Entities Analyzed</span>
            <Users className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-black text-charcoal-950 mt-2">{Math.max(entities.length, MASTER_ENTITIES.length)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-charcoal-600 font-mono">
            <span>28 States • 96.4% Resolution</span>
          </div>
        </Link>

        <Link
          href="/explorer"
          className="p-5 rounded-3xl glass-card shadow-sm hover:shadow-md hover:border-slate-400 transition group"
        >
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold">Detected Relationships</span>
            <Network className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-black text-charcoal-950 mt-2">{graphMetrics?.edge_count || 1850}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-charcoal-600 font-mono">
            <span>Financials, CDRs, Convoy Edges</span>
          </div>
        </Link>

        <Link
          href="/alerts"
          className="p-5 rounded-3xl glass-card shadow-sm hover:shadow-md hover:border-slate-400 transition group"
        >
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold">Suspicious Patterns</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-black text-amber-700 mt-2">{alerts.filter((a) => a.status === 'open').length}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-700 font-semibold">
            <span>{alerts.filter((a) => a.severity === 'critical').length} Critical Unresolved</span>
          </div>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 60-DAY NETWORK ACTIVITY TREND GRAPH */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl glass-panel space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-charcoal-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-700" />
              <span>60-Day Network Activity & Velocity Trends</span>
            </h3>
            <p className="text-[11px] text-charcoal-600 mt-0.5">
              Aggregated daily volume, multi-hop financial transfers, and odd-hour communication surges.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full bg-white border border-beige-300 text-xs">
            <button
              onClick={() => setActiveMetricTab('transactions')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                activeMetricTab === 'transactions' ? 'bg-charcoal-900 text-beige-100' : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveMetricTab('volumeLakhs')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                activeMetricTab === 'volumeLakhs' ? 'bg-charcoal-900 text-beige-100' : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
            >
              Volume (₹ Lakhs)
            </button>
            <button
              onClick={() => setActiveMetricTab('anomalies')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                activeMetricTab === 'anomalies' ? 'bg-charcoal-900 text-beige-100' : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
            >
              ML Anomalies
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ACTIVITY_60_DAYS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dayLabel" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '16px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey={activeMetricTab}
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#metricGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP INFLUENTIAL ENTITIES & RECENT ALERTS (Clickable) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Influential Suspects Table (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-charcoal-950">Top Influential Entities</h3>
              <p className="text-[11px] text-charcoal-600 mt-0.5">Click any entity to inspect its profile and linked cases.</p>
            </div>
            <Link href="/entities" className="text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1">
              <span>Full Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-beige-300 text-charcoal-500 font-medium">
                  <th className="pb-3 font-semibold">Entity</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Influence</th>
                  <th className="pb-3 font-semibold">Risk Rating</th>
                  <th className="pb-3 font-semibold text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {entities.slice(0, 6).map((e) => (
                  <tr
                    key={e.entityId}
                    onClick={() => setSelectedEntity(e)}
                    className="hover:bg-white/70 transition cursor-pointer group"
                  >
                    <td className="py-3 font-medium text-charcoal-950 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                        {e.label.charAt(0)}
                      </div>
                      <div>
                        <span className="group-hover:text-sky-700 transition font-bold">{e.label}</span>
                        <span className="text-[10px] text-charcoal-400 font-mono ml-1.5">({e.entityId})</span>
                      </div>
                    </td>
                    <td className="py-3 capitalize text-charcoal-700">{e.type}</td>
                    <td className="py-3 font-mono font-bold text-charcoal-900">{e.influenceScore || 80}/100</td>
                    <td className="py-3">
                      {e.riskFlag ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700 border border-red-200 font-semibold">
                          Flagged Target
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-white text-charcoal-600 border border-beige-300">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelectedEntity(e);
                        }}
                        className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 ml-auto"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Anomaly Alerts Feed (1 Col) */}
        <div className="p-6 rounded-3xl glass-panel space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-charcoal-950 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Recent Live Alerts</span>
              </h3>
              <Link href="/alerts" className="text-xs text-sky-700 hover:text-sky-900 font-bold">
                View All
              </Link>
            </div>
            <p className="text-[11px] text-charcoal-600 mt-0.5">Click an alert to view explainability and triage.</p>

            <div className="space-y-3 mt-4">
              {alerts.slice(0, 4).map((a) => (
                <div
                  key={a.alertId}
                  onClick={() => setSelectedAlert(a)}
                  className="p-3.5 rounded-2xl bg-white/80 border border-beige-300 shadow-sm space-y-1.5 hover:border-slate-400 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        a.severity === 'critical'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {a.severity}
                    </span>
                    <span className="text-[9px] font-mono text-charcoal-400">{a.detectorName}</span>
                  </div>
                  <h4 className="font-bold text-charcoal-950 text-xs line-clamp-1">{a.title}</h4>
                  <p className="text-[11px] text-charcoal-600 line-clamp-2 leading-relaxed">{a.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-beige-200 flex items-center justify-between text-xs">
            <span className="text-[11px] text-charcoal-500">10 detectors running</span>
            <Link href="/alerts" className="font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1">
              <span>Full Alert Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK ENTITY DOSSIER MODAL */}
      {/* ========================================================================= */}
      {selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-beige-300 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                  {selectedEntity.label.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal-950">{selectedEntity.label}</h3>
                  <p className="text-xs text-charcoal-500 font-mono">ID: {selectedEntity.entityId} • Type: {selectedEntity.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="p-1.5 rounded-full hover:bg-beige-200 text-charcoal-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-beige-100/70 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-charcoal-500 font-semibold">Influence Score</span>
                <p className="text-base font-black text-charcoal-950">{selectedEntity.influenceScore}/100</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-charcoal-500 font-semibold">Risk Classification</span>
                <p className={`text-xs font-bold mt-1 ${selectedEntity.riskFlag ? 'text-red-700' : 'text-emerald-700'}`}>
                  {selectedEntity.riskFlag ? 'Flagged High-Risk Target' : 'Normal Standing'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-charcoal-800">Designation / Profile:</p>
              <p className="text-charcoal-600 bg-white p-2.5 rounded-xl border border-beige-200">
                {selectedEntity.properties?.designation || 'Operational entity listed in master syndicate registry.'}
              </p>
            </div>

            {selectedEntity.connectedEntities && selectedEntity.connectedEntities.length > 0 && (
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-charcoal-800">Direct Network Connections ({selectedEntity.connectedEntities.length}):</p>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                  {selectedEntity.connectedEntities.map((c) => (
                    <span
                      key={c.entityId}
                      className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-charcoal-800 text-[11px] font-mono"
                    >
                      {c.label} ({c.relationship})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-beige-200 flex items-center justify-between">
              <Link
                href={`/entities?q=${encodeURIComponent(selectedEntity.label)}`}
                className="px-4 py-2 bg-charcoal-900 text-beige-100 rounded-full text-xs font-bold hover:bg-charcoal-800 transition flex items-center gap-1.5"
              >
                <span>Full Profile in Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSelectedEntity(null)}
                className="px-4 py-2 rounded-full border border-beige-300 text-charcoal-700 text-xs font-semibold hover:bg-beige-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK ALERT TRIAGE MODAL */}
      {/* ========================================================================= */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-beige-300 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-2xl ${
                    selectedAlert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal-950">{selectedAlert.title}</h3>
                  <p className="text-[11px] text-charcoal-500 font-mono">Detector: {selectedAlert.detectorName} • Status: {selectedAlert.status}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1.5 rounded-full hover:bg-beige-200 text-charcoal-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-beige-100/70 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-mono text-charcoal-500 font-semibold">Detection Methodology & Why Flagged</span>
              <p className="text-charcoal-700 leading-relaxed">{selectedAlert.explanation}</p>
              <p className="text-[11px] text-charcoal-500 italic pt-1 border-t border-beige-200">
                Rule engine confidence: {(selectedAlert.confidence * 100).toFixed(0)}%
              </p>
            </div>

            <div className="pt-3 border-t border-beige-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDismissAlert(selectedAlert.alertId)}
                  className="px-3.5 py-1.5 rounded-full border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50 transition"
                >
                  Dismiss Alert
                </button>
                <Link
                  href="/alerts"
                  className="px-3.5 py-1.5 bg-charcoal-900 text-beige-100 rounded-full text-xs font-bold hover:bg-charcoal-800 transition"
                >
                  Investigate in Alert Center
                </Link>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-3 py-1.5 text-xs text-charcoal-500 hover:text-charcoal-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
