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
    <div className="min-h-screen bg-[#fafbfc] text-charcoal-900 flex flex-col selection:bg-slate-200 selection:text-charcoal-950 font-sans">
      {/* Floating Pill Navbar with Auth Trigger */}
      <LandingNavbar onOpenAuth={openAuth} />

      {/* Hero Section */}
      <section className="relative pt-36 pb-16 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-slate-200/50 blur-[120px] rounded-full pointer-events-none" />

        {/* Official Platform Tag Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-[11px] font-medium text-slate-700 shadow-xs mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-charcoal-900">CIRCUIT 2.0</span>
          <span className="text-slate-400">•</span>
          <span>Criminal Intelligence & Connected-Entity Tracking</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-charcoal-950 tracking-tight leading-[1.12] max-w-4xl">
          Connecting Hidden Criminal Networks{' '}
          <span className="text-slate-600 font-bold">Across Jurisdictions.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-normal">
          An integrated investigative operating system for law enforcement agencies, cyber cells, and financial intelligence units to track syndicates, dismantle money laundering pipelines, and generate court-admissible evidence.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          {user ? (
            <>
              <Link
                href={getDashboardHref()}
                className="px-7 py-3.5 rounded-full bg-charcoal-950 hover:bg-charcoal-900 text-white font-semibold text-xs shadow-md shadow-charcoal-950/10 transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-300" />
                <span>Go to Active Workspace</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/explorer"
                className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-charcoal-900 border border-slate-200 text-xs font-semibold transition-all hover:border-slate-300 shadow-xs cursor-pointer active:scale-98 flex items-center gap-2"
              >
                <Network className="w-4 h-4 text-slate-600" />
                <span>Open Graph Explorer</span>
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuth('investigator')}
                className="px-7 py-3.5 rounded-full bg-charcoal-950 hover:bg-charcoal-900 text-white font-semibold text-xs shadow-md shadow-charcoal-950/10 transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>Access Agency Portal</span>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </button>
              <a
                href="#live-preview"
                className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-charcoal-900 border border-slate-200 text-xs font-semibold transition-all hover:border-slate-300 shadow-xs cursor-pointer active:scale-98 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-slate-600" />
                <span>System Architecture</span>
              </a>
            </>
          )}
        </div>

        {/* High-Level Credibility Metrics */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-8 border-t border-slate-200/70 text-left">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-xl font-extrabold text-charcoal-950 font-mono">10 Patterns</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Automated Anomaly Rules</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-xl font-extrabold text-charcoal-950 font-mono">Sec. 63 BSA</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Section 65B IEA Certified</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-xl font-extrabold text-charcoal-950 font-mono">Multi-Modal</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">FIR, CDR & Banking Streams</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-xl font-extrabold text-charcoal-950 font-mono">AES-128</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Biometric Identity Vault</div>
          </div>
        </div>
      </section>

      {/* Live Case Intelligence Product Teaser Window */}
      <section id="live-preview" className="py-8 px-6 max-w-6xl mx-auto w-full">
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">
                CASE: CR-2026-00124 • Operation Nightfall (Hawala Corridor)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase">
                Active Surveillance
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                50+ Entities Connected
              </span>
            </div>
          </div>

          {/* Body Interactive Snapshot */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Suspect & Entity Resolution */}
            <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-900 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-600" />
                  <span>Primary Target Profile</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                  Risk Score: 94%
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-charcoal-950 text-sm">Rajesh Verma (Alias: RV / Cargo Raja)</div>
                <div className="text-[11px] text-slate-500 font-mono">PAN: ABCPV9182K • Phone: +91 98201 44891</div>
                <div className="text-[11px] text-slate-600 pt-1">
                  Key link between Mumbai freight terminal and 6 offshore shell factoring firms.
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>Linked FIRs: 3 Official Filings</span>
                <span className="text-slate-900 font-semibold">4 Articulation Hops</span>
              </div>
            </div>

            {/* Column 2: Financial Hawala Anomaly */}
            <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-900 flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-slate-600" />
                  <span>Financial Flow Anomaly</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Smurfing Detected
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>ACC-918237 → ACC-102938</span>
                    <span className="font-bold text-charcoal-950">₹ 48,500.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ACC-771239 → ACC-102938</span>
                    <span className="font-bold text-charcoal-950">₹ 49,000.00</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600">
                  Deliberate sub-₹50,000 deposits aggregating to ₹1.48 Cr to evade mandatory PAN reporting.
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>Dispersal Window: &lt; 24h</span>
                <span className="text-emerald-700 font-semibold">96% Loop Confidence</span>
              </div>
            </div>

            {/* Column 3: Legal & Provenance Certificate */}
            <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-900 flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-slate-600" />
                  <span>Court-Admissible Dossier</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  SHA-256 Validated
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-mono text-[11px] text-slate-500 truncate">
                  DIGEST: 8f9a2bc41d...6e7a8b
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  Automated Section 63 Bharatiya Sakshya Adhiniyam certificate with full evidentiary chain of custody.
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => openAuth('investigator')}
                  className="w-full py-2 rounded-xl bg-charcoal-950 hover:bg-charcoal-900 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
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
      <section id="capabilities" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-200/70">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono uppercase text-slate-500 font-bold tracking-wider">
            Operational Capabilities
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 mt-1.5">
            Engineered for Modern Intelligence Workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-charcoal-900 flex items-center justify-center shadow-xs">
              <Network className="w-5 h-5 text-slate-800" />
            </div>
            <h3 className="font-bold text-sm text-charcoal-950">Multi-Entity Graph Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Resolve polymorphic entities across phone numbers, corporate shell structures, and physical safehouses.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-charcoal-900 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5 text-slate-800" />
            </div>
            <h3 className="font-bold text-sm text-charcoal-950">10-Rule Anomaly Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Surveillance tracking for circular hawala loops, rapid money chains, pass-through mules, and nocturnal calls.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-charcoal-900 flex items-center justify-center shadow-xs">
              <FileCheck className="w-5 h-5 text-slate-800" />
            </div>
            <h3 className="font-bold text-sm text-charcoal-950">Human-in-the-Loop OCR</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ingest multi-page FIRs and bank statements. Review extracted entities and relations before graph commit.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-charcoal-900 flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5 text-slate-800" />
            </div>
            <h3 className="font-bold text-sm text-charcoal-950">Court Dossier Generator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate structured, Section 63 BSA / 65B IEA compliant evidence dossiers with cryptographic hashes.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works / Tactical Pipeline */}
      <section id="pipeline" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-200/70">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono uppercase text-slate-500 font-bold tracking-wider">
            Evidence-to-Action Architecture
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 mt-1.5">
            How CIRCUIT Processes Case Intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-2.5 shadow-xs">
            <span className="font-mono text-xs text-slate-400 font-bold">STAGE 01</span>
            <h4 className="font-bold text-sm text-charcoal-950">Multi-Modal Ingestion</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload scanned FIRs, RTGS/NEFT transaction ledgers, and telecommunication CDR call logs into a secure vault.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-2.5 shadow-xs">
            <span className="font-mono text-xs text-slate-400 font-bold">STAGE 02</span>
            <h4 className="font-bold text-sm text-charcoal-950">Entity Resolution & Topology</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extract identifiers (PAN, Aadhaar, IMEI, vehicle plates) and construct interconnected topological networks.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-2.5 shadow-xs">
            <span className="font-mono text-xs text-slate-400 font-bold">STAGE 03</span>
            <h4 className="font-bold text-sm text-charcoal-950">Threat Alerts & Judicial Export</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trigger instant anomaly alerts on pass-through accounts and export statutory case dossiers for prosecution.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Access Controls */}
      <section id="security" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-200/70 text-center">
        <div className="max-w-2xl mx-auto space-y-3.5">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-950 text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-5 h-5 text-slate-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-950">
            Enterprise Law Enforcement Security
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Strict Role-Based Access Controls (RBAC), immutable audit logging on every action, and Fernet AES-encrypted biometric vaults built to strict intelligence standards.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-charcoal-950">CIRCUIT 2.0</span>
            <span>• Criminal Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <button
              type="button"
              onClick={() => openAuth('investigator')}
              className="hover:text-charcoal-950 cursor-pointer"
            >
              Portal Login
            </button>
            <Link href="/explorer" className="hover:text-charcoal-950">Graph Explorer</Link>
            <Link href="/fir-track" className="hover:text-charcoal-950">FIR Registry</Link>
            <Link href="/reports" className="hover:text-charcoal-950">Court Reports</Link>
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
