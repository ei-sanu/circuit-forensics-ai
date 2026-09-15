'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Settings as SettingsIcon,
  Database,
  Cpu,
  Shield,
  Sliders,
  Bell,
  CheckCircle2,
  AlertTriangle,
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
  ChevronRight,
  Palette,
  CreditCard,
  Gift,
  Boxes,
  KeyRound,
  MonitorSmartphone,
  Check,
  Laptop,
  Sun,
  Moon,
  Volume2,
  HardDrive,
  Network,
} from 'lucide-react';
import { getCurrentUser, AuthUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { BiometricEnrollmentModal } from '@/components/settings/BiometricEnrollmentModal';

type SettingsTab =
  | 'account'
  | 'password'
  | 'connected'
  | 'sessions'
  | 'billing'
  | 'credits'
  | 'integrations'
  | 'notifications'
  | 'params'
  | 'users'
  | 'biometrics'
  | 'system';

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioTargetUser, setBioTargetUser] = useState<{ id?: string; email?: string } | null>(null);
  const [myBioStatus, setMyBioStatus] = useState<any | null>(null);

  // Notification Preferences
  const [audioAlarms, setAudioAlarms] = useState(true);
  const [pushFirMatches, setPushFirMatches] = useState(true);
  const [highRiskEmail, setHighRiskEmail] = useState(true);

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

  // Password Management State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(res.message || 'Password successfully updated in Supabase PostgreSQL Database.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password in database.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle URL search parameter sync
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SettingsTab;
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const changeTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.push(`/settings?tab=${tab}`, { scroll: false });
  };

  const loadUsersData = async () => {
    setUsersLoading(true);
    try {
      const [pending, all] = await Promise.all([
        api.getPendingUsers().catch(() => []),
        api.getAllUsers().catch(() => []),
      ]);
      setPendingUsers(pending || []);
      setAllUsers(all || []);
    } catch {
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
        createdByHr: false,
      });
      setShowAddUserModal(false);
      setNewUser({
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
      loadUsersData();
      alert('New user account provisioned and active immediately!');
    } catch (err: any) {
      alert(`Creation error: ${err.message}`);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'account':
        return 'Account & Profile';
      case 'password':
        return 'Password & Security';
      case 'connected':
        return 'Connected Accounts';
      case 'sessions':
        return 'Active Sessions';
      case 'billing':
        return 'Billing & Compute Quota';
      case 'credits':
        return 'Intelligence Credits';
      case 'integrations':
        return 'API Integrations';
      case 'notifications':
        return 'Notifications & Alarms';
      case 'params':
        return 'ML & Anomaly Parameters';
      case 'users':
        return 'User Management & HR Approvals';
      case 'biometrics':
        return 'Biometric 2FA & Identity Vault';
      case 'system':
        return 'Infrastructure & Cloud Telemetry';
      default:
        return 'Settings';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in text-neutral-900 dark:text-neutral-100">
      {/* Breadcrumbs matching Reference Screenshot */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 font-medium">
        <Link href="/dashboard" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <Link href="/settings" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition">
          Settings
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{getTabTitle()}</span>
      </nav>

      {/* Main Page Title */}
      <div className="border-b border-neutral-200/80 dark:border-slate-800 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {getTabTitle()}
        </h1>
      </div>

      {/* Settings Navigation Tabs Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-200/80 dark:border-slate-800 text-xs font-semibold scrollbar-none">
        <button
          onClick={() => changeTab('account')}
          className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'account'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm font-bold'
              : 'bg-white dark:bg-slate-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Account</span>
        </button>

        <button
          onClick={() => changeTab('password')}
          className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'password'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm font-bold'
              : 'bg-white dark:bg-slate-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-slate-800'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Password</span>
        </button>

        <button
          onClick={() => changeTab('params')}
          className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'params'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm font-bold'
              : 'bg-white dark:bg-slate-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>ML Parameters</span>
        </button>

        <button
          onClick={() => changeTab('users')}
          className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'users'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm font-bold'
              : 'bg-white dark:bg-slate-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Approvals</span>
          {pendingUsers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-neutral-950 font-mono text-[10px] font-extrabold">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => changeTab('biometrics')}
          className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'biometrics'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm font-bold'
              : 'bg-white dark:bg-slate-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-slate-800'
          }`}
        >
          <Scan className="w-3.5 h-3.5 text-blue-500" />
          <span>Biometrics</span>
        </button>

        <button
          onClick={() => changeTab('connected')}
          className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'connected'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm font-bold'
              : 'bg-white dark:bg-slate-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-slate-800'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Connected</span>
        </button>

        <button
          onClick={() => changeTab('system')}
          className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'system'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm font-bold'
              : 'bg-white dark:bg-slate-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Telemetry</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Configuration saved and propagated across active nodes!</span>
        </div>
      )}

      {/* TAB 1: ACCOUNT */}
      {activeTab === 'account' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center gap-4 border-b border-neutral-200/80 dark:border-slate-800 pb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'CO'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{user?.name || 'Lead Officer'}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">{user?.email || 'officer@circuit.gov'}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {user?.role?.replace('_', ' ') || 'Investigator'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200/60 dark:border-slate-700 space-y-1">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">Department / Wing</span>
              <p className="font-bold text-neutral-900 dark:text-white">{user?.department || 'Cyber & Financial Crime Intelligence Division'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200/60 dark:border-slate-700 space-y-1">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">Badge / Officer ID</span>
              <p className="font-bold text-neutral-900 dark:text-white font-mono">{user?.badgeNumber || 'MH-POL-2026-8841'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200/60 dark:border-slate-700 space-y-1">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">Jurisdiction Station</span>
              <p className="font-bold text-neutral-900 dark:text-white">{user?.stationName || 'Colaba Cyber Crime PS, Mumbai South'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200/60 dark:border-slate-700 space-y-1">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">Security Clearance</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">Class 1 — Full Graph & Bio Vault Access</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PASSWORD */}
      {activeTab === 'password' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xs space-y-6 max-w-xl animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Security & Password Credentials</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Update your account password and synchronize directly with the Supabase database.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold">{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span className="font-semibold">{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full p-2.5 rounded-2xl bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-sm hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              {passwordLoading ? 'Updating Database...' : 'Update Password in Database'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: CONNECTED ACCOUNTS & INFRASTRUCTURE */}
      {activeTab === 'connected' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">Supabase PostgreSQL Cluster</h3>
                  <p className="text-[11px] text-neutral-500 font-mono">kgubavovqnfibqmjcjad • Port 5432</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Connected
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Primary transactional and FIR relational data lake storing real-time entity profiles.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">Python ML Microservice</h3>
                  <p className="text-[11px] text-neutral-500 font-mono">http://127.0.0.1:8001 • NetworkX</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Healthy (10/10)
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Graph PageRank, community Louvain clustering, mule account structuring and anomaly scoring.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">CCTNS National Data Sync</h3>
                  <p className="text-[11px] text-neutral-500 font-mono">cctns-api.gov.in • TLS 1.3</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Authorized
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Interoperable Criminal Justice System (ICJS) sync conduit for FIR and warrant verification.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">Redis Cache & Memory Queue</h3>
                  <p className="text-[11px] text-neutral-500 font-mono">redis://cluster-01 • In-Memory</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Sub-millisecond pub/sub message bus routing live match broadcast alarms across open tabs.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-fade-in text-xs">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Active Authorized Sessions</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MonitorSmartphone className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white">Command Control Terminal (This Device)</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800">Current</span>
                  </div>
                  <p className="text-neutral-500 font-mono text-[11px]">IP: 103.21.144.92 • macOS Sequoia • Chrome 129</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">Active Now</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BILLING & COMPUTE CREDITS */}
      {(activeTab === 'billing' || activeTab === 'credits') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-fade-in text-xs">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Intelligence Compute & ML Quota</h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              Departmental resource allocation for high-dimensional graph traversals and LLM intelligence queries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 space-y-2">
              <span className="text-neutral-500 font-medium">Graph Traversal Credits</span>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">842,900</p>
              <div className="w-full bg-neutral-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-3/4 rounded-full" />
              </div>
              <p className="text-[10px] text-neutral-400">75% remaining of 1,000,000 monthly quota</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 space-y-2">
              <span className="text-neutral-500 font-medium">AI Copilot Inference Tokens</span>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">14.8M</p>
              <div className="w-full bg-neutral-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-2/3 rounded-full" />
              </div>
              <p className="text-[10px] text-neutral-400">Unlimited Government Tier Plan</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 space-y-2">
              <span className="text-neutral-500 font-medium">Biometric Verification Scans</span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">Unlimited</p>
              <div className="w-full bg-neutral-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-full rounded-full" />
              </div>
              <p className="text-[10px] text-neutral-400">On-prem hardware accelerated</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-fade-in text-xs">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Intelligence Pipeline Integrations</h2>
          <div className="space-y-3">
            {[
              { title: 'Telecom CDR / IPDR Ingestion Feed', desc: 'Auto-parses cell tower dump logs and suspicious call frequencies', status: 'Active' },
              { title: 'Banking FinTech Ledger Parser', desc: 'Direct OFX and CSV structured ledger mapper for hawala detection', status: 'Active' },
              { title: 'Facial Recognition & CCTV Grid Stream', desc: 'Real-time camera feed facial vector embeddings pipeline', status: 'Active' },
              { title: 'ANPR Vehicle License Plate Stream', desc: 'Highway toll matrix automatic number plate recognition alerts', status: 'Active' },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">{item.title}</p>
                  <p className="text-neutral-500 text-[11px]">{item.desc}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-fade-in text-xs max-w-xl">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Alerts & Notification Channels</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 cursor-pointer">
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">Real-Time Audio Alarms</p>
                <p className="text-[11px] text-neutral-500">Play chime when critical syndicate match is discovered</p>
              </div>
              <input
                type="checkbox"
                checked={audioAlarms}
                onChange={(e) => setAudioAlarms(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 cursor-pointer">
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">Push FIR Cross-Match Broadcasts</p>
                <p className="text-[11px] text-neutral-500">Instant notification when a newly filed FIR matches an active suspect</p>
              </div>
              <input
                type="checkbox"
                checked={pushFirMatches}
                onChange={(e) => setPushFirMatches(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 cursor-pointer">
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">High-Risk Anomaly Digest</p>
                <p className="text-[11px] text-neutral-500">Email summary when rapid layering exceeds ₹50 Lakhs</p>
              </div>
              <input
                type="checkbox"
                checked={highRiskEmail}
                onChange={(e) => setHighRiskEmail(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB 9: ML PARAMETERS */}
      {activeTab === 'params' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 space-y-4 shadow-xs md:col-span-2">
            <h3 className="text-xs font-mono uppercase font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-200/80 dark:border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Python ML Anomaly Engine Parameter Tuning</span>
            </h3>

            <form onSubmit={handleSaveParams} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200">
                    Rapid Transfer Turnover Window (Hours)
                  </label>
                  <input
                    type="number"
                    value={rapidWindowHours}
                    onChange={(e) => setRapidWindowHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-2xl font-mono text-neutral-900 dark:text-white outline-none shadow-xs"
                  />
                  <p className="text-[10px] text-neutral-500">Flags accounts forwarding funds within this timeframe.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200">
                    Pass-Through Forwarding Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={passThroughPercent}
                    onChange={(e) => setPassThroughPercent(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-2xl font-mono text-neutral-900 dark:text-white outline-none shadow-xs"
                  />
                  <p className="text-[10px] text-neutral-500">Ratio of received funds forwarded to trigger mule alert.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200">
                    Odd-Hour Communication Window
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={oddHourStart}
                      onChange={(e) => setOddHourStart(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-2xl font-mono text-neutral-900 dark:text-white outline-none shadow-xs"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={oddHourEnd}
                      onChange={(e) => setOddHourEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-2xl font-mono text-neutral-900 dark:text-white outline-none shadow-xs"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500">Night window for burner phone surveillance surges.</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-sm hover:opacity-90 transition cursor-pointer"
                >
                  Apply Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 10: USER MANAGEMENT & HR APPROVALS */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Administrative User Review & Provisioning</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Review HR submitted onboarding requests and provision official credentials</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-5 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision User Directly</span>
            </button>
          </div>

          {/* Pending HR Approvals */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Pending HR Submissions Awaiting Admin Approval ({pendingUsers.length})</span>
              </h4>
              <span className="text-[11px] font-mono text-neutral-500">Admin Review Required</span>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                <p className="font-bold">No Pending Onboarding Requests</p>
                <p className="text-[11px]">All personnel submitted by HR have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((p) => (
                  <div
                    key={p._id}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white">{p.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 uppercase">
                          {p.role.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 font-mono">{p.email} • Badge: {p.badgeNumber || 'N/A'}</p>
                      {p.stationName && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                          Station: {p.stationName} ({p.district}) • Incharge: {p.inchargeRank}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(p._id)}
                        className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Activate</span>
                      </button>
                      <button
                        onClick={() => handleReject(p._id)}
                        className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
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

          {/* All Users Register */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Master Personnel Credential Register</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-slate-800 text-neutral-500 font-mono font-bold">
                    <th className="p-3">Officer Name & Email</th>
                    <th className="p-3">Assigned Role</th>
                    <th className="p-3">Jurisdiction / Department</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-slate-800">
                  {allUsers.map((u) => (
                    <tr key={u._id || u.email} className="hover:bg-neutral-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3">
                        <span className="font-bold text-neutral-900 dark:text-white block">{u.name}</span>
                        <span className="font-mono text-neutral-500 text-[10px]">{u.email}</span>
                      </td>
                      <td className="p-3 font-semibold capitalize text-neutral-800 dark:text-neutral-200">
                        {u.role.replace('_', ' ')}
                      </td>
                      <td className="p-3 text-neutral-500 dark:text-neutral-400">
                        {u.stationName ? `${u.stationName} (${u.district})` : u.department || 'Operations Wing'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            u.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : u.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
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

      {/* TAB 11: BIOMETRICS & IDENTITY VAULT */}
      {activeTab === 'biometrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-mono uppercase font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-200 dark:border-slate-800 pb-2">
              <Scan className="w-4 h-4 text-blue-600" />
              <span>Personal Biometric Identity Vault</span>
            </h3>

            <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-3 text-xs shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Identity Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${myBioStatus?.hasEnrolled !== false ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  {myBioStatus?.hasEnrolled !== false ? 'Active & Enrolled' : 'Pending Enrollment'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Vault Encryption:</span>
                <span className="font-mono text-neutral-200 font-bold">{myBioStatus?.algorithm || 'AES-256-GCM Authenticated'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Model Pipeline:</span>
                <span className="font-mono text-neutral-200">{myBioStatus?.modelVersion || 'circuit-facenet-v1'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Quality Score:</span>
                <span className="font-mono text-emerald-400 font-bold">{myBioStatus?.qualityScore || 96.5}%</span>
              </div>
            </div>

            <button
              onClick={() => {
                setBioTargetUser({ id: user?.id, email: user?.email });
                setShowBioModal(true);
              }}
              className="w-full py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-sm hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{myBioStatus?.hasEnrolled ? 'Re-enroll / Update Biometric Template' : 'Enroll Biometric Face Identity'}</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-mono uppercase font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-200 dark:border-slate-800 pb-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Biometric 2-Factor Security Policy</span>
            </h3>

            <div className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">1:1 Cosine Similarity Threshold</p>
                  <p className="text-[10px] text-neutral-500">Minimum vector similarity for authentication</p>
                </div>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                  0.78 (78%)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">Active Liveness & Anti-Spoofing</p>
                  <p className="text-[10px] text-neutral-500">Blink & presentation attack detection</p>
                </div>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  ENFORCED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 12: SYSTEM TELEMETRY */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-mono uppercase font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-200 dark:border-slate-800 pb-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Microservices & Database Status</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white">Supabase PostgreSQL Cluster</p>
                    <p className="text-[10px] text-neutral-500 font-mono">kgubavovqnfibqmjcjad • TLS 1.3</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  Connected
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white">Python ML Anomaly Engine</p>
                    <p className="text-[10px] text-neutral-500 font-mono">http://127.0.0.1:8001</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                  Healthy
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200/80 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-mono uppercase font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-200 dark:border-slate-800 pb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Officer Profile RBAC</span>
            </h3>

            <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-2.5 text-xs shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Name:</span>
                <span className="font-bold text-white text-sm">{user?.name || 'System Administrator'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Official Email:</span>
                <span className="font-mono text-neutral-300">{user?.email || 'admin@circuit.gov'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Assigned RBAC Role:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-600 text-white">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-4 animate-scale-in">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Direct Officer / Station Provisioning</h3>
            <form onSubmit={handleDirectAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-2xl text-neutral-900 dark:text-white outline-none shadow-xs cursor-pointer"
                >
                  <option value="police_station">District Police Station Incharge</option>
                  <option value="investigator">Field Investigator</option>
                  <option value="analyst">Financial Analyst</option>
                  <option value="admin">System Admin</option>
                  <option value="hr">HR Personnel</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspector Rajesh Sawant"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-2xl text-neutral-900 dark:text-white outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rajesh@circuit.gov"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-2xl text-neutral-900 dark:text-white outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-2xl text-neutral-900 dark:text-white outline-none shadow-xs"
                />
              </div>

              {newUser.role === 'police_station' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">District</label>
                    <input
                      type="text"
                      placeholder="Mumbai South"
                      value={newUser.district}
                      onChange={(e) => setNewUser({ ...newUser, district: e.target.value })}
                      className="w-full p-2 bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-2xl text-neutral-900 dark:text-white outline-none shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-medium">Station Name</label>
                    <input
                      type="text"
                      placeholder="Colaba PS"
                      value={newUser.stationName}
                      onChange={(e) => setNewUser({ ...newUser, stationName: e.target.value })}
                      className="w-full p-2 bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 rounded-2xl text-neutral-900 dark:text-white outline-none shadow-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-5 py-2.5 rounded-full bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-sm hover:opacity-90 transition cursor-pointer"
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

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
