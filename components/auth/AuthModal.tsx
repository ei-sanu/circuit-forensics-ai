'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, X, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { setAuthToken, setCurrentUser } from '@/lib/auth';

import { BiometricVerification } from './BiometricVerification';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'investigator' | 'analyst' | 'admin' | 'police_station' | 'hr';
}

export function AuthModal({ isOpen, onClose, defaultRole }: AuthModalProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState<'CREDENTIALS' | 'BIOMETRIC_VERIFY'>('CREDENTIALS');
  const [challengeData, setChallengeData] = useState<{ challengeId: string; user: any } | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset fields when opened
  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
      setAuthState('CREDENTIALS');
      setChallengeData(null);
    }
  }, [isOpen, defaultRole]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.login({ email, password });
      
      if (res.status === 'FACE_VERIFICATION_REQUIRED') {
        setChallengeData({
          challengeId: res.challengeId,
          user: res.user,
        });
        setAuthState('BIOMETRIC_VERIFY');
        return;
      }

      setAuthToken(res.accessToken);
      setCurrentUser(res.user);
      onClose();
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
    onClose();
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
      onClose();
      redirectToDashboard(roleType);
    } catch (err: any) {
      setError(err.message || `Failed to authenticate as ${roleType}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Translucent Dark Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Main Content Area */}
      {authState === 'BIOMETRIC_VERIFY' && challengeData ? (
        <div className="relative z-10 animate-scale-in">
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
        /* Modal Card - High Contrast Black & White */
        <div className="relative w-full max-w-sm z-10 animate-scale-in">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-7 shadow-2xl relative text-white">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

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
              <span className="mr-8 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-neutral-900 text-neutral-300 border border-neutral-800 font-semibold tracking-tight">
                TLS 1.3
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
                    <span>Authenticate & Verify</span>
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

            {/* RBAC Quick Role Testing */}
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

          {/* Security Subtitle */}
          <p className="text-center text-[10px] text-neutral-500 font-medium mt-3 font-mono">
            Strict 1:1 Facial Biometric Verification • Zero Password Bypass
          </p>
        </div>
      )}
    </div>
  );
}
