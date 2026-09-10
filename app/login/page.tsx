'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { setAuthToken, setCurrentUser } from '@/lib/auth';
import { BiometricVerification } from '@/components/auth/BiometricVerification';

export default function LoginPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'CREDENTIALS' | 'BIOMETRIC_VERIFY'>('CREDENTIALS');
  const [challengeData, setChallengeData] = useState<{ challengeId: string; user: any } | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.login({ email, password });
      
      if (res.status === 'FACE_VERIFICATION_REQUIRED') {
        // Smooth transition to live 2-factor facial biometric verification
        setChallengeData({
          challengeId: res.challengeId,
          user: res.user,
        });
        setAuthState('BIOMETRIC_VERIFY');
        return;
      }

      // Direct JWT fallback
      setAuthToken(res.accessToken);
      setCurrentUser(res.user);
      redirectToDashboard(res.user.role);
    } catch (err: any) {
      setError(err.message || 'Invalid official credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricSuccess = (authResult: { accessToken: string; user: any }) => {
    setAuthToken(authResult.accessToken);
    setCurrentUser(authResult.user);
    redirectToDashboard(authResult.user.role);
  };

  const redirectToDashboard = (userRole?: string) => {
    if (userRole === 'police_station') {
      router.push('/police');
    } else if (userRole === 'hr') {
      router.push('/hr');
    } else {
      router.push('/dashboard');
    }
  };

  const handleRoleQuickLogin = async (roleType: 'investigator' | 'analyst' | 'admin' | 'police_station' | 'hr') => {
    setLoading(true);
    setError('');
    try {
      const res = await api.demoLogin(roleType);
      setAuthToken(res.accessToken);
      setCurrentUser(res.user);
      redirectToDashboard(roleType);
    } catch (err: any) {
      setError(err.message || `Failed to authenticate as ${roleType}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 relative overflow-hidden selection:bg-neutral-800 selection:text-white">
      {/* Top Back Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium bg-neutral-900 px-3.5 py-1.5 rounded-full border border-neutral-800 shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Home</span>
      </Link>

      {/* Main Container: Conditioned on Auth State */}
      {authState === 'BIOMETRIC_VERIFY' && challengeData ? (
        <div className="z-10 animate-scale-in">
          <BiometricVerification
            challengeId={challengeData.challengeId}
            claimedUser={challengeData.user}
            onSuccess={handleBiometricSuccess}
            onCancel={() => {
              setAuthState('CREDENTIALS');
              setChallengeData(null);
            }}
          />
        </div>
      ) : (
        /* Credentials Input State - Pure Black & White */
        <div className="w-full max-w-sm z-10 animate-scale-in">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-7 shadow-2xl relative text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black font-bold shadow-sm">
                  <Shield className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-white tracking-wider">CIRCUIT</h2>
                  <p className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase">
                    Law Enforcement Portal
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-neutral-900 text-neutral-300 border border-neutral-800 font-semibold tracking-tight">
                Biometric 2FA
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs font-medium leading-tight">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1.5 text-xs">
                  Official ID / Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@circuit.gov"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1.5 text-xs">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none transition shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-white hover:bg-neutral-200 active:scale-[0.98] text-black font-extrabold text-xs transition shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Credentials</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Account Provisioning Notice */}
            <div className="mt-4 p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-neutral-300 shrink-0 mt-0.5" />
              <span>
                Officer accounts are provisioned centrally by <strong className="text-white">HR Directorate</strong> or <strong className="text-white">Admin</strong>.
              </span>
            </div>

            {/* Fast Roles Demo Bypass */}
            <div className="mt-4 pt-3.5 border-t border-neutral-800 text-center">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2 font-semibold">
                Quick Role Testing (Development)
              </p>
              <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRoleQuickLogin('investigator')}
                  className="py-2 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-[11px] text-neutral-200 hover:text-white font-medium transition cursor-pointer disabled:opacity-50"
                >
                  Investigator
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRoleQuickLogin('analyst')}
                  className="py-2 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-[11px] text-neutral-200 hover:text-white font-medium transition cursor-pointer disabled:opacity-50"
                >
                  Analyst
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRoleQuickLogin('admin')}
                  className="py-2 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-[11px] text-neutral-200 hover:text-white font-medium transition cursor-pointer disabled:opacity-50"
                >
                  Admin
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRoleQuickLogin('police_station')}
                  className="py-2 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-[11px] text-neutral-200 hover:text-white font-medium transition cursor-pointer disabled:opacity-50"
                >
                  Police Station
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRoleQuickLogin('hr')}
                  className="py-2 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-[11px] text-neutral-200 hover:text-white font-medium transition cursor-pointer disabled:opacity-50"
                >
                  HR Directorate
                </button>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <p className="text-center text-[10px] text-neutral-500 font-medium mt-3 font-mono">
            Strict 1:1 Facial Biometric Verification • Zero Password Bypass
          </p>
        </div>
      )}
    </div>
  );
}
