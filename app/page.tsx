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
  Landmark,
  Phone,
  Scale,
  Cpu,
  Fingerprint,
  FileSpreadsheet,
  Zap,
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
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white font-sans">
      {/* Official Government of India Statutory Top Banner */}
      <div className="w-full bg-[#05070d] border-b border-slate-800 text-white text-[11px] px-4 py-1.5 sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Ashoka Lion Emblem */}
            <div className="w-5 h-6 text-amber-400 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 64 88" fill="currentColor" className="w-full h-full">
                <path d="M32 4 C27 4 23 8 23 13 C23 16 25 18 27 20 C25 21 24 23 24 26 C24 30 27 33 32 33 C37 33 40 30 40 26 C40 23 39 21 37 20 C39 18 41 16 41 13 C41 8 37 4 32 4 Z" opacity="0.95" />
                <path d="M19 12 C14 12 11 16 11 20 C11 23 13 25 15 27 C13 28 12 31 13 34 C14 38 18 40 22 39 C22 36 21 34 21 31 C22 28 21 26 20 24 C21 22 22 20 21 17 C21 14 20 13 19 12 Z" opacity="0.85" />
                <path d="M45 12 C50 12 53 16 53 20 C53 23 51 25 49 27 C51 28 52 31 51 34 C50 38 46 40 42 39 C42 36 43 34 43 31 C42 28 43 26 44 24 C43 22 42 20 43 17 C43 14 44 13 45 12 Z" opacity="0.85" />
                <path d="M26 31 C26 31 23 38 23 44 C23 47 25 49 32 49 C39 49 41 47 41 44 C41 38 38 31 38 31 Z" />
                <rect x="14" y="49" width="36" height="4" rx="1" />
                <circle cx="32" cy="59" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="32" cy="59" r="1.5" />
                <rect x="10" y="65" width="44" height="3" rx="1" />
                <path d="M15 68 C20 74 24 76 32 76 C40 76 44 74 49 68 Z" opacity="0.9" />
                <rect x="8" y="77" width="48" height="2" rx="0.5" opacity="0.6" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-devanagari font-bold text-amber-400 text-xs">भारत सरकार</span>
              <span className="text-slate-600">|</span>
              <span className="font-sans font-bold text-[10.5px] uppercase tracking-wider text-slate-200">
                GOVERNMENT OF INDIA
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400 text-[10px] hidden sm:inline">
                Ministry of Home Affairs • Indian Cyber Crime Coordination Centre (I4C)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span className="hidden md:inline text-red-400 font-semibold">CYBER HELPLINE: 1930</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              OFFICIAL STATUTORY PORTAL
            </span>
          </div>
        </div>
      </div>

      {/* Floating Pill Navbar with Auth Trigger */}
      <LandingNavbar onOpenAuth={openAuth} />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-sky-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none" />

        {/* Official Platform Tag Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] font-medium text-slate-200 shadow-md mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-devanagari font-bold text-amber-400">भारत सरकार</span>
          <span className="text-slate-600">|</span>
          <span className="font-semibold text-white">Government of India</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-400 text-[10px]">Ministry of Home Affairs (I4C)</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black text-white tracking-tight leading-[1.12] max-w-4xl">
          Connecting Hidden Criminal Networks{' '}
          <span className="text-sky-400 font-black">Across Jurisdictions.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
          An integrated investigative operating system for law enforcement agencies, cyber cells, and financial intelligence units to track syndicates, dismantle money laundering pipelines, and generate court-admissible evidence.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          {user ? (
            <>
              <Link
                href={getDashboardHref()}
                className="px-7 py-3.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-white" />
                <span>Go to Active Workspace</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
              <Link
                href="/explorer"
                className="px-7 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-all hover:border-slate-600 shadow-xs cursor-pointer active:scale-98 flex items-center gap-2"
              >
                <Network className="w-4 h-4 text-sky-400" />
                <span>Open Graph Explorer</span>
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuth('investigator')}
                className="px-7 py-3.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>Access Agency Portal</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
              <a
                href="#live-preview"
                className="px-7 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-all hover:border-slate-600 shadow-xs cursor-pointer active:scale-98 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>System Architecture</span>
              </a>
            </>
          )}
        </div>

        {/* High-Level Credibility Metrics */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-8 border-t border-slate-800 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="text-xl font-black text-white font-mono">10 Patterns</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Automated Anomaly Rules</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="text-xl font-black text-white font-mono">Sec. 63 BSA</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Section 65B IEA Certified</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="text-xl font-black text-white font-mono">Multi-Modal</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">FIR, CDR & Banking Streams</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="text-xl font-black text-white font-mono">AES-128</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Biometric Identity Vault</div>
          </div>
        </div>
      </section>

      {/* Live Case Intelligence Product Teaser Window */}
      <section id="live-preview" className="py-8 px-6 max-w-6xl mx-auto w-full">
        <div className="rounded-3xl bg-[#0b0f19] border border-slate-800 shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-200">
                CASE: CR-2026-00124 • Operation Nightfall (Hawala Corridor)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/30">
                Active Surveillance
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-700">
                50+ Entities Connected
              </span>
            </div>
          </div>

          {/* Body Interactive Snapshot */}
          <div className="p-6 bg-[#0a0f1d] grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Suspect & Entity Resolution */}
            <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>Primary Target Profile</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  Risk Score: 94%
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-white text-sm">Rajesh Verma (Alias: RV / Cargo Raja)</div>
                <div className="text-[11px] text-slate-400 font-mono">PAN: ABCPV9182K • Phone: +91 98201 44891</div>
                <div className="text-[11px] text-slate-300 pt-1">
                  Key link between Mumbai freight terminal and 6 offshore shell factoring firms.
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Linked FIRs: 3 Official Filings</span>
                <span className="text-sky-400 font-semibold">4 Articulation Hops</span>
              </div>
            </div>

            {/* Column 2: Financial Hawala Anomaly */}
            <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>Financial Flow Anomaly</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Smurfing Detected
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>ACC-918237 → ACC-102938</span>
                    <span className="font-bold text-white">₹ 48,500.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>ACC-771239 → ACC-102938</span>
                    <span className="font-bold text-white">₹ 49,000.00</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-300">
                  Deliberate sub-₹50,000 deposits aggregating to ₹1.48 Cr to evade mandatory PAN reporting.
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Dispersal Window: &lt; 24h</span>
                <span className="text-emerald-400 font-semibold">96% Loop Confidence</span>
              </div>
            </div>

            {/* Column 3: Legal & Provenance Certificate */}
            <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-sky-400" />
                  <span>Court-Admissible Dossier</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  SHA-256 Validated
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-mono text-[11px] text-slate-400 truncate">
                  DIGEST: 8f9a2bc41d...6e7a8b
                </div>
                <div className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  Automated Section 63 Bharatiya Sakshya Adhiniyam certificate with full evidentiary chain of custody.
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => openAuth('investigator')}
                  className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/25"
                >
                  <span>Examine Case Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section id="capabilities" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono uppercase text-sky-400 font-bold tracking-wider">
            Operational Capabilities
          </h2>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">
            Engineered for Modern Intelligence Workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800/90 shadow-md hover:border-sky-500/40 hover:shadow-lg transition space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800/80 text-sky-400 border border-slate-700/60 flex items-center justify-center shadow-xs">
              <Network className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Multi-Entity Graph Analytics</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Resolve polymorphic entities across phone numbers, corporate shell structures, and physical safehouses.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800/90 shadow-md hover:border-sky-500/40 hover:shadow-lg transition space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800/80 text-amber-400 border border-slate-700/60 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-bold text-sm text-white">10-Rule Anomaly Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Surveillance tracking for circular hawala loops, rapid money chains, pass-through mules, and nocturnal calls.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800/90 shadow-md hover:border-sky-500/40 hover:shadow-lg transition space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800/80 text-emerald-400 border border-slate-700/60 flex items-center justify-center shadow-xs">
              <FileCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Human-in-the-Loop OCR</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ingest multi-page FIRs and bank statements. Review extracted entities and relations before graph commit.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800/90 shadow-md hover:border-sky-500/40 hover:shadow-lg transition space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800/80 text-purple-400 border border-slate-700/60 flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Court Dossier Generator</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Generate structured, Section 63 BSA / 65B IEA compliant evidence dossiers with cryptographic hashes.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works / Tactical Pipeline */}
      <section id="pipeline" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono uppercase text-sky-400 font-bold tracking-wider">
            Evidence-to-Action Architecture
          </h2>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">
            How CIRCUIT Processes Case Intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800/90 space-y-2.5 shadow-md">
            <span className="font-mono text-xs text-sky-400 font-bold">STAGE 01</span>
            <h4 className="font-bold text-sm text-white">Multi-Modal Ingestion</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload scanned FIRs, RTGS/NEFT transaction ledgers, and telecommunication CDR call logs into a secure vault.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800/90 space-y-2.5 shadow-md">
            <span className="font-mono text-xs text-sky-400 font-bold">STAGE 02</span>
            <h4 className="font-bold text-sm text-white">Entity Resolution & Topology</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Extract identifiers (PAN, Aadhaar, IMEI, vehicle plates) and construct interconnected topological networks.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800/90 space-y-2.5 shadow-md">
            <span className="font-mono text-xs text-sky-400 font-bold">STAGE 03</span>
            <h4 className="font-bold text-sm text-white">Threat Alerts & Judicial Export</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Trigger instant anomaly alerts on pass-through accounts and export statutory case dossiers for prosecution.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Access Controls */}
      <section id="security" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-800 text-center">
        <div className="max-w-2xl mx-auto space-y-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-sky-400 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-5 h-5 text-sky-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Enterprise Law Enforcement Security
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Strict Role-Based Access Controls (RBAC), immutable audit logging on every action, and Fernet AES-encrypted biometric vaults built to strict intelligence standards.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-slate-800 bg-[#05070d] text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">CIRCUIT 2.0</span>
            <span>• Criminal Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <button
              type="button"
              onClick={() => openAuth('investigator')}
              className="hover:text-white cursor-pointer"
            >
              Portal Login
            </button>
            <Link href="/explorer" className="hover:text-white">Graph Explorer</Link>
            <Link href="/fir-track" className="hover:text-white">FIR Registry</Link>
            <Link href="/reports" className="hover:text-white">Court Reports</Link>
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
