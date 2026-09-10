'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowRight,
  Network,
  FileText,
  AlertTriangle,
  Bot,
  Shield,
  Activity,
  Users,
  Search,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  Sparkles,
  UserPlus,
  Compass,
  FileCheck,
  LayoutDashboard,
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { AuthModal } from '@/components/auth/AuthModal';
import { getCurrentUser, AuthUser } from '@/lib/auth';

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'investigator' | 'analyst' | 'admin' | 'police_station' | 'hr'>('investigator');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const openAuth = (role: 'investigator' | 'analyst' | 'admin' | 'police_station' | 'hr' = 'investigator') => {
    setSelectedRole(role);
    setAuthModalOpen(true);
  };

  const getDashboardHref = () => {
    if (!user) return '#';
    if (user.role === 'police_station') return '/police';
    if (user.role === 'hr') return '/hr';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-white text-charcoal-900 flex flex-col selection:bg-sky-200 selection:text-charcoal-950">
      {/* Floating Pill Navbar with Auth Trigger */}
      <LandingNavbar onOpenAuth={openAuth} />

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Subtle Ambient Light Auras on White */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-sky-100/50 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[300px] bg-slate-100/70 blur-[100px] rounded-full pointer-events-none" />

        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-beige-300/80 text-xs font-mono text-charcoal-700 shadow-sm mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>CIRCUIT v2.0 • Law Enforcement & Intelligence Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-950 tracking-tight leading-[1.14] max-w-4xl">
          Unmasking Hidden Syndicates Through{' '}
          <span className="bg-gradient-to-r from-charcoal-950 via-charcoal-800 to-charcoal-600 bg-clip-text text-transparent">
            Connected Intelligence
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-charcoal-600 max-w-2xl leading-relaxed font-normal">
          Ingest unstructured FIRs, bank statements, and Call Detail Records. Build live knowledge graphs, pinpoint hidden money laundering loops, and empower investigative decision-making with explainable AI.
        </p>

        {/* Action Buttons (Dynamically responding to Auth State) */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {user ? (
            <>
              <Link
                href={getDashboardHref()}
                className="px-8 py-4 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs shadow-xl shadow-charcoal-900/15 transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer hover:shadow-2xl"
              >
                <LayoutDashboard className="w-4 h-4 text-beige-300" />
                <span>Go to Active Dashboard</span>
                <ArrowRight className="w-4 h-4 text-beige-300" />
              </Link>
              <Link
                href="/explorer"
                className="px-8 py-4 rounded-full bg-white/80 hover:bg-white text-charcoal-800 border border-beige-300/80 text-xs font-bold transition-all hover:border-charcoal-400 shadow-md backdrop-blur-md cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Network className="w-4 h-4 text-sky-600" />
                <span>Explore Neural Graph</span>
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuth('investigator')}
                className="px-8 py-4 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs shadow-xl shadow-charcoal-900/15 transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer hover:shadow-2xl"
              >
                <span>Launch Investigator Console</span>
                <ArrowRight className="w-4 h-4 text-beige-300" />
              </button>
              <button
                type="button"
                onClick={() => openAuth('investigator')}
                className="px-8 py-4 rounded-full bg-white/80 hover:bg-white text-charcoal-800 border border-beige-300/80 text-xs font-semibold transition-all hover:border-charcoal-400 shadow-md backdrop-blur-md cursor-pointer active:scale-95"
              >
                Sign In with Agency ID
              </button>
            </>
          )}
        </div>

        {/* Specialized Operational Consoles - 5 Complete Roles */}
        <div id="roles" className="mt-16 w-full max-w-4xl p-5 sm:p-6 rounded-3xl glass-panel shadow-xl">
          <p className="text-[11px] font-mono uppercase text-charcoal-500 font-bold tracking-wider text-left mb-3.5 px-2">
            Select Your Specialized Operational Console:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Investigator Card */}
            {user ? (
              <Link
                href="/dashboard"
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-beige-300/70 hover:border-charcoal-400 text-left transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">
                      Investigator
                    </span>
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                  </div>
                  <p className="text-[10px] text-charcoal-600 mt-1.5 leading-relaxed">
                    Suspect graphs, cases & evidence timelines.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-charcoal-500 font-bold mt-2 flex items-center gap-0.5">
                  <span>Access</span>
                  <ChevronRight className="w-3 h-3 text-charcoal-400" />
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuth('investigator')}
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-beige-300/70 hover:border-charcoal-400 text-left transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">
                      Investigator
                    </span>
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                  </div>
                  <p className="text-[10px] text-charcoal-600 mt-1.5 leading-relaxed">
                    Suspect graphs, cases & evidence timelines.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-charcoal-500 font-bold mt-2 flex items-center gap-0.5">
                  <span>Sign In</span>
                  <ChevronRight className="w-3 h-3 text-charcoal-400" />
                </span>
              </button>
            )}

            {/* Analyst Card */}
            {user ? (
              <Link
                href="/dashboard"
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-beige-300/70 hover:border-charcoal-400 text-left transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">
                      Analyst
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  </div>
                  <p className="text-[10px] text-charcoal-600 mt-1.5 leading-relaxed">
                    Money mule flows & circular loop anomalies.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-charcoal-500 font-bold mt-2 flex items-center gap-0.5">
                  <span>Access</span>
                  <ChevronRight className="w-3 h-3 text-charcoal-400" />
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuth('analyst')}
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-beige-300/70 hover:border-charcoal-400 text-left transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">
                      Analyst
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  </div>
                  <p className="text-[10px] text-charcoal-600 mt-1.5 leading-relaxed">
                    Money mule flows & circular loop anomalies.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-charcoal-500 font-bold mt-2 flex items-center gap-0.5">
                  <span>Sign In</span>
                  <ChevronRight className="w-3 h-3 text-charcoal-400" />
                </span>
              </button>
            )}

            {/* Police Station Card */}
            {user ? (
              <Link
                href="/police"
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-beige-300/70 hover:border-charcoal-400 text-left transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">
                      Police Station
                    </span>
                    <span className="w-2 h-2 rounded-full bg-cyan-600" />
                  </div>
                  <p className="text-[10px] text-charcoal-600 mt-1.5 leading-relaxed">
                    File official FIRs with AI OCR & live alerts.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-charcoal-500 font-bold mt-2 flex items-center gap-0.5">
                  <span>Access</span>
                  <ChevronRight className="w-3 h-3 text-charcoal-400" />
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuth('police_station')}
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-beige-300/70 hover:border-charcoal-400 text-left transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">
                      Police Station
                    </span>
                    <span className="w-2 h-2 rounded-full bg-cyan-600" />
                  </div>
                  <p className="text-[10px] text-charcoal-600 mt-1.5 leading-relaxed">
                    File official FIRs with AI OCR & live alerts.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-charcoal-500 font-bold mt-2 flex items-center gap-0.5">
                  <span>Sign In</span>
                  <ChevronRight className="w-3 h-3 text-charcoal-400" />
                </span>
              </button>
            )}

            {/* HR Onboarding Card */}
            {user ? (
              <Link
                href="/hr"
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-beige-300/70 hover:border-charcoal-400 text-left transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">
                      HR Directorate
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                  </div>
                  <p className="text-[10px] text-charcoal-600 mt-1.5 leading-relaxed">
                    Personnel hiring, credentials & station roles.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-charcoal-500 font-bold mt-2 flex items-center gap-0.5">
                  <span>Access</span>
                  <ChevronRight className="w-3 h-3 text-charcoal-400" />
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuth('hr')}
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-beige-300/70 hover:border-charcoal-400 text-left transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">
                      HR Directorate
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                  </div>
                  <p className="text-[10px] text-charcoal-600 mt-1.5 leading-relaxed">
                    Personnel hiring, credentials & station roles.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-charcoal-500 font-bold mt-2 flex items-center gap-0.5">
                  <span>Sign In</span>
                  <ChevronRight className="w-3 h-3 text-charcoal-400" />
                </span>
              </button>
            )}

            {/* Admin Card */}
            {user ? (
              <Link
                href="/dashboard"
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-beige-300/70 hover:border-charcoal-400 text-left transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">
                      Administrator
                    </span>
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <p className="text-[10px] text-charcoal-600 mt-1.5 leading-relaxed">
                    Compliance audit trails & system controls.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-charcoal-500 font-bold mt-2 flex items-center gap-0.5">
                  <span>Access</span>
                  <ChevronRight className="w-3 h-3 text-charcoal-400" />
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuth('admin')}
                className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-beige-300/70 hover:border-charcoal-400 text-left transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 transition-colors">
                      Administrator
                    </span>
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <p className="text-[10px] text-charcoal-600 mt-1.5 leading-relaxed">
                    Compliance audit trails & system controls.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-charcoal-500 font-bold mt-2 flex items-center gap-0.5">
                  <span>Sign In</span>
                  <ChevronRight className="w-3 h-3 text-charcoal-400" />
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-20 px-6 max-w-6xl mx-auto border-t border-beige-300/60">
        <div className="text-center mb-14">
          <h2 className="text-xs font-mono uppercase text-charcoal-500 font-bold tracking-wider">
            Engineered For Law Enforcement & Intelligence Units
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 mt-2">
            Four Pillars of Connected Investigative Power
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl glass-card hover:border-charcoal-400 hover:shadow-xl hover:-translate-y-1 transition-all space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-charcoal-900 flex items-center justify-center text-beige-100 shadow-md">
              <Network className="w-5 h-5 text-beige-300" />
            </div>
            <h3 className="font-extrabold text-sm text-charcoal-950">Multi-Entity Graph Analytics</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Resolve polymorphic entities across burner phones, corporate shells, and physical safehouses.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl glass-card hover:border-charcoal-400 hover:shadow-xl hover:-translate-y-1 transition-all space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-charcoal-900 flex items-center justify-center text-beige-100 shadow-md">
              <AlertTriangle className="w-5 h-5 text-beige-300" />
            </div>
            <h3 className="font-extrabold text-sm text-charcoal-950">10-Rule Anomaly Engine</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Real-time detection of circular money flows, rapid transit hops, and high-frequency communication bursts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl glass-card hover:border-charcoal-400 hover:shadow-xl hover:-translate-y-1 transition-all space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-charcoal-900 flex items-center justify-center text-beige-100 shadow-md">
              <FileText className="w-5 h-5 text-beige-300" />
            </div>
            <h3 className="font-extrabold text-sm text-charcoal-950">Human-in-the-Loop OCR</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Upload multi-page FIRs and court documents. Review AI proposals before committing to the master graph.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl glass-card hover:border-charcoal-400 hover:shadow-xl hover:-translate-y-1 transition-all space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-charcoal-900 flex items-center justify-center text-beige-100 shadow-md">
              <Bot className="w-5 h-5 text-beige-300" />
            </div>
            <h3 className="font-extrabold text-sm text-charcoal-950">Investigative Copilot</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Natural language intelligence assistant with citation-backed evidence chains and judicial export reports.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works / Architecture Section */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto border-t border-beige-300/60">
        <div className="text-center mb-14">
          <h2 className="text-xs font-mono uppercase text-charcoal-500 font-bold tracking-wider">
            Evidence-to-Action Pipeline
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 mt-2">
            How CIRCUIT Processes Intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-panel space-y-3 shadow-md">
            <span className="font-mono text-xs text-charcoal-400 font-bold">01 / INGESTION</span>
            <h4 className="font-bold text-base text-charcoal-950">Unstructured Document Ingestion</h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Secure multi-format ingestion of scanned FIRs, RTGS/NEFT transaction ledgers, and CDR phone dumps.
            </p>
          </div>
          <div className="p-6 rounded-3xl glass-panel space-y-3 shadow-md">
            <span className="font-mono text-xs text-charcoal-400 font-bold">02 / RESOLUTION</span>
            <h4 className="font-bold text-base text-charcoal-950">AI Resolution & Graphing</h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Named Entity Recognition (NER) extracts key entities and constructs multidimensional topological graphs.
            </p>
          </div>
          <div className="p-6 rounded-3xl glass-panel space-y-3 shadow-md">
            <span className="font-mono text-xs text-charcoal-400 font-bold">03 / ENFORCEMENT</span>
            <h4 className="font-bold text-base text-charcoal-950">Alerts & Tactical Case Reports</h4>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Automatic alert dispatches notify station leads and investigators with actionable judicial evidence trails.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section id="security" className="py-20 px-6 max-w-6xl mx-auto border-t border-beige-300/60 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-900 text-beige-100 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6 text-beige-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-950">
            Enterprise Law Enforcement Security
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            Strict Role-Based Access Controls (RBAC), immutable audit logging on every action, and end-to-end encrypted storage pipelines compliant with intelligence standards.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-beige-300/60 bg-white/40 text-center text-xs text-charcoal-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CIRCUIT AI Intelligence Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => openAuth('investigator')}
              className="hover:text-charcoal-950 cursor-pointer"
            >
              Portal Login
            </button>
            <Link href="/explorer" className="hover:text-charcoal-950">Neural Explorer</Link>
            <Link href="/fir-track" className="hover:text-charcoal-950">FIR Registry</Link>
          </div>
        </div>
      </footer>

      {/* Quick Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultRole={selectedRole}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
