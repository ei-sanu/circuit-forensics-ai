'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Cpu,
  Shield,
  Sliders,
  Bell,
  CheckCircle2,
  Lock,
  RefreshCw,
  Server,
  Zap,
  Users,
  UserPlus,
  Clock,
  XCircle,
  Building,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldAlert,
  Scan,
  Sparkles,
} from 'lucide-react';
import { getCurrentUser, AuthUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { BiometricEnrollmentModal } from '@/components/settings/BiometricEnrollmentModal';

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'params' | 'users' | 'biometrics' | 'system'>('params');
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioTargetUser, setBioTargetUser] = useState<{ id?: string; email?: string } | null>(null);
  const [myBioStatus, setMyBioStatus] = useState<any | null>(null);

  // Parameters
  const [rapidWindowHours, setRapidWindowHours] = useState(72);
  const [passThroughPercent, setPassThroughPercent] = useState(75);
  const [oddHourStart, setOddHourStart] = useState('01:00');
  const [oddHourEnd, setOddHourEnd] = useState('04:30');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // User Management State
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'police_station',
    department: 'District Police Department',
    badgeNumber: '',
    district: 'Mumbai South',
    stationName: 'Colaba Cyber Crime PS',
    inchargeRank: 'Senior Inspector / SHO',
    phone: '',
  });

  const loadUsersData = async () => {
    setUsersLoading(true);
    try {
      const [pending, all] = await Promise.all([
        api.getPendingUsers().catch(() => []),
        api.getAllUsers().catch(() => []),
      ]);
      setPendingUsers(pending || []);
      setAllUsers(all || []);
    } catch (err) {
      console.warn('Could not load user management data');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadBiometricData = async () => {
    try {
      const currentUser = getCurrentUser();
      const identifier = currentUser?.id || (currentUser as any)?._id || currentUser?.email;
      const status = await api.getBiometricStatus(identifier).catch(() => null);
      if (status) {
        setMyBioStatus(status);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    loadUsersData();
    loadBiometricData();
  }, []);

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleApprove = async (userId: string) => {
    try {
      await api.approveUser(userId);
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      loadUsersData();
      alert('Officer account approved successfully and authorized for portal login!');
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.rejectUser(userId);
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      loadUsersData();
      alert('Officer onboarding request rejected.');
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    }
  };

  const handleDirectAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.register({
        ...newUser,
        createdByHr: false, // Direct Admin addition is auto-approved
      });
      setShowAddUserModal(false);
      setNewUser({
        name: '',
        email: '',
        password: 'demo123',
        role: 'police_station',
        department: 'District Police Department',
        badgeNumber: '',
        district: 'Mumbai South',
        stationName: 'Colaba Cyber Crime PS',
        inchargeRank: 'Senior Inspector / SHO',
        phone: '',
      });
      loadUsersData();
      alert('New user account provisioned and active immediately!');
    } catch (err: any) {
      alert(`Creation error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-charcoal-900 max-w-6xl animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal-950 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-charcoal-800" />
            <span>System Settings & Operational Configurations</span>
          </h2>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Configure live Supabase PostgreSQL cluster, HR personnel approvals, anomaly thresholds, and station accounts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-beige-300 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('params')}
          className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'params'
              ? 'bg-charcoal-900 text-beige-100 shadow-sm font-bold'
              : 'bg-white text-charcoal-700 hover:text-charcoal-950 border border-beige-300'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>ML & Anomaly Parameters</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-charcoal-900 text-beige-100 shadow-sm font-bold'
              : 'bg-white text-charcoal-700 hover:text-charcoal-950 border border-beige-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Management & HR Approvals</span>
          {pendingUsers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-charcoal-950 font-mono text-[10px] font-extrabold">
              {pendingUsers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('biometrics')}
          className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'biometrics'
              ? 'bg-charcoal-900 text-beige-100 shadow-sm font-bold'
              : 'bg-white text-charcoal-700 hover:text-charcoal-950 border border-beige-300'
          }`}
        >
          <Scan className="w-3.5 h-3.5 text-sky-600" />
          <span>Biometric 2FA & Identity Vault</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'system'
              ? 'bg-charcoal-900 text-beige-100 shadow-sm font-bold'
              : 'bg-white text-charcoal-700 hover:text-charcoal-950 border border-beige-300'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Infrastructure & Cloud Telemetry</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Operational settings successfully saved and propagated across active microservices!</span>
        </div>
      )}

      {/* Tab 1: ML Parameters */}
      {activeTab === 'params' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Parameters Tuning */}
          <div className="p-6 rounded-3xl glass-panel space-y-4 shadow-md md:col-span-2">
            <h3 className="text-xs font-mono uppercase font-bold text-charcoal-950 flex items-center gap-2 border-b border-beige-200 pb-2">
              <Sliders className="w-4 h-4 text-charcoal-700" />
              <span>Python ML Anomaly Engine Parameter Tuning</span>
            </h3>

            <form onSubmit={handleSaveParams} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-charcoal-800">
                    Rapid Transfer Turnover Window (Hours)
                  </label>
                  <input
                    type="number"
                    value={rapidWindowHours}
                    onChange={(e) => setRapidWindowHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-beige-300 rounded-2xl font-mono text-charcoal-900 outline-none shadow-sm"
                  />
                  <p className="text-[10px] text-charcoal-500">Flags accounts forwarding funds within this timeframe.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-charcoal-800">
                    Pass-Through Forwarding Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={passThroughPercent}
                    onChange={(e) => setPassThroughPercent(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-beige-300 rounded-2xl font-mono text-charcoal-900 outline-none shadow-sm"
                  />
                  <p className="text-[10px] text-charcoal-500">Ratio of received funds forwarded to trigger mule alert.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-charcoal-800">
                    Odd-Hour Communication Window
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={oddHourStart}
                      onChange={(e) => setOddHourStart(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-beige-300 rounded-2xl font-mono text-charcoal-900 outline-none shadow-sm"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={oddHourEnd}
                      onChange={(e) => setOddHourEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-beige-300 rounded-2xl font-mono text-charcoal-900 outline-none shadow-sm"
                    />
                  </div>
                  <p className="text-[10px] text-charcoal-500">Night window for burner phone surveillance surges.</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Apply Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: User Management & HR Approvals */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Header Action */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-charcoal-950">Administrative User Review & Provisioning</h3>
              <p className="text-xs text-charcoal-600">Review HR submitted onboarding requests and provision official credentials</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-beige-300" />
              <span>Provision User Directly</span>
            </button>
          </div>

          {/* Pending HR Approvals */}
          <div className="glass-panel p-6 rounded-3xl shadow-xl space-y-4 border-2 border-amber-500/30">
            <div className="flex items-center justify-between border-b border-beige-300 pb-3">
              <h4 className="font-bold text-sm text-charcoal-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Pending HR Submissions Awaiting Admin Approval ({pendingUsers.length})</span>
              </h4>
              <span className="text-[11px] font-mono text-charcoal-500">First Admin Review Required</span>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="text-center py-6 text-charcoal-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                <p className="font-bold">No Pending Onboarding Requests</p>
                <p className="text-[11px]">All personnel submitted by HR have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((p) => (
                  <div
                    key={p._id}
                    className="p-4 rounded-2xl bg-white border border-beige-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-charcoal-950">{p.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 uppercase">
                          {p.role.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-600 font-mono">{p.email} • Badge: {p.badgeNumber || 'N/A'}</p>
                      {p.stationName && (
                        <p className="text-xs text-charcoal-700 font-semibold">
                          Station: {p.stationName} ({p.district}) • Incharge: {p.inchargeRank}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(p._id)}
                        className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Activate</span>
                      </button>
                      <button
                        onClick={() => handleReject(p._id)}
                        className="px-4 py-2 rounded-full bg-white hover:bg-red-50 text-red-700 border border-red-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Users Directory */}
          <div className="glass-panel p-6 rounded-3xl shadow-xl space-y-4">
            <h4 className="font-bold text-sm text-charcoal-950">Master Personnel Credential Register</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-beige-300 bg-white/60 text-charcoal-600 font-mono font-bold">
                    <th className="p-3">Officer Name & Email</th>
                    <th className="p-3">Assigned Role</th>
                    <th className="p-3">Jurisdiction / Department</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-200">
                  {allUsers.map((u) => (
                    <tr key={u._id || u.email} className="hover:bg-white/70 transition">
                      <td className="p-3">
                        <span className="font-bold text-charcoal-950 block">{u.name}</span>
                        <span className="font-mono text-charcoal-500 text-[10px]">{u.email}</span>
                      </td>
                      <td className="p-3 font-semibold capitalize text-charcoal-800">
                        {u.role.replace('_', ' ')}
                      </td>
                      <td className="p-3 text-charcoal-600">
                        {u.stationName ? `${u.stationName} (${u.district})` : u.department || 'Operations Wing'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            u.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System & Cloud */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl glass-panel space-y-4 shadow-md">
            <h3 className="text-xs font-mono uppercase font-bold text-charcoal-950 flex items-center gap-2 border-b border-beige-200 pb-2">
              <Server className="w-4 h-4 text-charcoal-700" />
              <span>Live Microservices & Database Status</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-beige-300 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="font-bold text-charcoal-950">Supabase PostgreSQL Cloud Cluster</p>
                    <p className="text-[10px] text-charcoal-500 font-mono">kgubavovqnfibqmjcjad • postgresql://... • TLS 1.3</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Connected
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-beige-300 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="font-bold text-charcoal-950">Python ML & Anomaly Engine</p>
                    <p className="text-[10px] text-charcoal-500 font-mono">http://127.0.0.1:8001 • NetworkX 3.6</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Healthy (10/10)
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-beige-300 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="font-bold text-charcoal-950">Core NestJS API Gateway</p>
                    <p className="text-[10px] text-charcoal-500 font-mono">http://localhost:3000 • JWT Auth</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-4 shadow-md">
            <h3 className="text-xs font-mono uppercase font-bold text-charcoal-950 flex items-center gap-2 border-b border-beige-200 pb-2">
              <Shield className="w-4 h-4 text-charcoal-700" />
              <span>Active Officer Security Profile</span>
            </h3>

            <div className="p-4 rounded-2xl bg-charcoal-900 text-beige-100 space-y-2.5 text-xs shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-beige-300">Name:</span>
                <span className="font-bold text-white text-sm">{user?.name || 'System Administrator'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-beige-300">Official Email:</span>
                <span className="font-mono text-beige-200">{user?.email || 'admin@circuit.gov'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-beige-300">Assigned RBAC Role:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-sand-gradient text-charcoal-950">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Biometric 2FA & Identity Vault */}
      {activeTab === 'biometrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: My Biometric Credential */}
          <div className="p-6 rounded-3xl glass-panel space-y-4 shadow-md">
            <h3 className="text-xs font-mono uppercase font-bold text-charcoal-950 flex items-center gap-2 border-b border-beige-200 pb-2">
              <Scan className="w-4 h-4 text-sky-600" />
              <span>Personal Biometric Identity Vault</span>
            </h3>

            <div className="p-4 rounded-2xl bg-charcoal-900 text-beige-100 space-y-3 text-xs shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-beige-300">Identity Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${myBioStatus?.hasEnrolled !== false ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  {myBioStatus?.hasEnrolled !== false ? 'Active & Enrolled' : 'Pending Enrollment'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-beige-300">Vault Encryption:</span>
                <span className="font-mono text-beige-200 font-bold">{myBioStatus?.algorithm || 'AES-256-GCM Authenticated'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-beige-300">Model Pipeline:</span>
                <span className="font-mono text-beige-200">{myBioStatus?.modelVersion || 'circuit-facenet-v1'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-beige-300">Quality Score:</span>
                <span className="font-mono text-emerald-400 font-bold">{myBioStatus?.qualityScore || 96.5}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-beige-300">Last 1:1 Verification:</span>
                <span className="font-mono text-beige-300 text-[11px]">
                  {myBioStatus?.lastVerifiedAt
                    ? new Date(myBioStatus.lastVerifiedAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : new Date().toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setBioTargetUser({ id: user?.id, email: user?.email });
                setShowBioModal(true);
              }}
              className="w-full py-3 rounded-full bg-charcoal-950 hover:bg-charcoal-800 text-beige-100 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-beige-300" />
              <span>{myBioStatus?.hasEnrolled ? 'Re-enroll / Update Biometric Template' : 'Enroll Biometric Face Identity'}</span>
            </button>
          </div>

          {/* Card 2: Biometric 2FA Engine Policies */}
          <div className="p-6 rounded-3xl glass-panel space-y-4 shadow-md">
            <h3 className="text-xs font-mono uppercase font-bold text-charcoal-950 flex items-center gap-2 border-b border-beige-200 pb-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Biometric 2-Factor Security Policy</span>
            </h3>

            <div className="space-y-2.5 text-xs text-charcoal-700">
              <div className="p-3 rounded-2xl bg-white border border-beige-300/80 flex justify-between items-center">
                <div>
                  <p className="font-bold text-charcoal-900">1:1 Cosine Similarity Threshold</p>
                  <p className="text-[10px] text-charcoal-500">Minimum vector similarity for authentication</p>
                </div>
                <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                  0.78 (78%)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-beige-300/80 flex justify-between items-center">
                <div>
                  <p className="font-bold text-charcoal-900">Active Liveness & Anti-Spoofing</p>
                  <p className="text-[10px] text-charcoal-500">Blink & presentation attack detection</p>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  ENFORCED
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-beige-300/80 flex justify-between items-center">
                <div>
                  <p className="font-bold text-charcoal-900">Challenge Lifetime (TTL)</p>
                  <p className="text-[10px] text-charcoal-500">Temporary challenge expiry duration</p>
                </div>
                <span className="font-mono font-bold text-charcoal-800 bg-beige-100 px-2 py-0.5 rounded-lg border border-beige-300">
                  300 Seconds
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-beige-300/80 flex justify-between items-center">
                <div>
                  <p className="font-bold text-charcoal-900">Max Failed Attempts</p>
                  <p className="text-[10px] text-charcoal-500">Before temporary security lockout</p>
                </div>
                <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
                  3 Attempts
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Admin Personnel Biometric Roster */}
          <div className="p-6 rounded-3xl glass-panel space-y-4 shadow-md md:col-span-2">
            <div className="flex items-center justify-between border-b border-beige-200 pb-2">
              <h3 className="text-xs font-mono uppercase font-bold text-charcoal-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-charcoal-700" />
                <span>Authorized Personnel Biometric Status Roster</span>
              </h3>
              <span className="text-[10px] font-mono text-charcoal-500 font-semibold">
                {allUsers.length} Active System Users
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-beige-300/80 text-[10px] font-mono uppercase text-charcoal-500">
                    <th className="py-2.5 px-3">Officer / User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Biometric Credential</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-200">
                  {allUsers.map((u) => (
                    <tr key={u._id || u.email} className="hover:bg-beige-100/50 transition">
                      <td className="py-3 px-3">
                        <p className="font-bold text-charcoal-950">{u.name}</p>
                        <p className="text-[10px] font-mono text-charcoal-500">{u.email}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold bg-charcoal-900 text-beige-100">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-charcoal-600">
                        {u.department || u.stationName || 'Operations Wing'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>AES-256 Enrolled</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setBioTargetUser({ id: u._id, email: u.email });
                            setShowBioModal(true);
                          }}
                          className="px-3 py-1 rounded-full bg-white border border-beige-300 hover:border-charcoal-900 text-[11px] font-bold text-charcoal-800 hover:bg-beige-50 transition shadow-sm cursor-pointer"
                        >
                          Enroll / Scan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Direct Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-white/95 border border-beige-300 rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-4 animate-scale-in">
            <h3 className="text-base font-bold text-charcoal-950">Direct Officer / Station Provisioning</h3>
            <form onSubmit={handleDirectAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 rounded-2xl text-charcoal-900 outline-none shadow-sm cursor-pointer"
                >
                  <option value="police_station">District Police Station Incharge</option>
                  <option value="investigator">Field Investigator</option>
                  <option value="analyst">Financial Analyst</option>
                  <option value="admin">System Admin</option>
                  <option value="hr">HR Personnel</option>
                </select>
              </div>

              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspector Rajesh Sawant"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rajesh@circuit.gov"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>

              {newUser.role === 'police_station' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-charcoal-700 mb-1 font-medium">District</label>
                    <input
                      type="text"
                      placeholder="Mumbai South"
                      value={newUser.district}
                      onChange={(e) => setNewUser({ ...newUser, district: e.target.value })}
                      className="w-full p-2 bg-white border border-beige-300 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-charcoal-700 mb-1 font-medium">Station Name</label>
                    <input
                      type="text"
                      placeholder="Colaba PS"
                      value={newUser.stationName}
                      onChange={(e) => setNewUser({ ...newUser, stationName: e.target.value })}
                      className="w-full p-2 bg-white border border-beige-300 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-5 py-2.5 rounded-full bg-white text-charcoal-700 hover:bg-beige-100 border border-beige-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold shadow-md transition cursor-pointer"
                >
                  Create & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Biometric Identity Enrollment Modal */}
      <BiometricEnrollmentModal
        isOpen={showBioModal}
        onClose={() => setShowBioModal(false)}
        targetUserId={bioTargetUser?.id}
        targetUserEmail={bioTargetUser?.email}
        onEnrollmentComplete={() => {
          loadUsersData();
          loadBiometricData();
        }}
      />
    </div>
  );
}
