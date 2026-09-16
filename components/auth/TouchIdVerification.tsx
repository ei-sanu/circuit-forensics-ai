'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Camera,
  Lock,
  User,
  Shield,
  Laptop,
} from 'lucide-react';
import { authenticateWithTouchId } from '@/lib/touchId';
import { api } from '@/lib/api';

interface TouchIdVerificationProps {
  challengeId: string;
  claimedUser: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    badgeNumber?: string;
    stationName?: string;
    department?: string;
  };
  onSuccess: (authResult: { accessToken: string; user: any }) => void;
  onCancel: () => void;
  onSwitchToFaceId: () => void;
}

type TouchIdState = 'IDLE' | 'PROMPTING' | 'VERIFYING' | 'VERIFIED' | 'FAILED' | 'LOCKED';

export function TouchIdVerification({
  challengeId,
  claimedUser,
  onSuccess,
  onCancel,
  onSwitchToFaceId,
}: TouchIdVerificationProps) {
  const [state, setState] = useState<TouchIdState>('IDLE');
  const [statusMessage, setStatusMessage] = useState('Touch ID ready. Touch sensor on your Mac.');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const isExecutingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const executeTouchId = useCallback(async () => {
    if (isExecutingRef.current || isLocked) return;
    isExecutingRef.current = true;

    setState('PROMPTING');
    setStatusMessage('Touch the Touch ID sensor on your Mac keyboard or trackpad...');
    setErrorMessage(null);

    try {
      const touchRes = await authenticateWithTouchId(challengeId, claimedUser);

      if (!touchRes.success) {
        isExecutingRef.current = false;
        setState('FAILED');
        const msg = touchRes.error || 'Touch ID verification was not completed.';
        setErrorMessage(msg);
        setStatusMessage('Touch ID prompt dismissed.');
        setAttemptsRemaining((prev) => Math.max(0, prev - 1));
        return;
      }

      setState('VERIFYING');
      setStatusMessage('Verifying Secure Enclave hardware cryptographic proof...');

      const authRes = await api.verifyTouchIdBiometric({
        challengeId,
        credential: touchRes.credential,
        deviceInfo: {
          platform: 'macOS',
          authenticator: 'Touch ID / Apple Secure Enclave',
          timestamp: new Date().toISOString(),
        },
      });

      setState('VERIFIED');
      setStatusMessage('Touch ID verified. Establishing secure session...');

      timeoutRef.current = setTimeout(() => {
        onSuccess(authRes);
      }, 900);
    } catch (err: any) {
      isExecutingRef.current = false;
      console.error('Touch ID verification error:', err);
      const msg = err.message || 'Touch ID verification failed.';
      setState('FAILED');
      setErrorMessage(msg);
      setStatusMessage(msg);

      if (msg.toLowerCase().includes('locked')) {
        setIsLocked(true);
        setState('LOCKED');
      } else {
        setAttemptsRemaining((prev) => Math.max(0, prev - 1));
      }
    }
  }, [challengeId, claimedUser, isLocked, onSuccess]);

  // Automatically trigger native Touch ID prompt on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      executeTouchId();
    }, 350);

    return () => {
      clearTimeout(timer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [executeTouchId]);

  return (
    <div className="w-full max-w-md bg-neutral-950 rounded-3xl p-6 shadow-2xl border border-neutral-800 text-white animate-scale-in relative overflow-hidden space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-sm">
            <Fingerprint className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight leading-none flex items-center gap-1.5">
              <span>CIRCUIT // TOUCH ID</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                macOS
              </span>
            </h3>
            <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-tighter">
              Apple Secure Enclave Hardware 2FA
            </p>
          </div>
        </div>

        {/* Claimed User Pill */}
        <div className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-bold text-neutral-300 flex items-center gap-1.5 shadow-sm truncate max-w-[150px]">
          <User className="w-3 h-3 text-white shrink-0" />
          <span className="truncate">{claimedUser.email}</span>
        </div>
      </div>

      {/* Main Touch ID Interactive Reticle Box */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl bg-gradient-to-b from-neutral-900/90 via-black to-neutral-950 overflow-hidden shadow-inner flex flex-col items-center justify-center border border-neutral-800 p-6 text-center space-y-4">
        {/* Hardware Status Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-[10px] font-mono text-neutral-300 shadow-sm">
          <Laptop className="w-3 h-3 text-emerald-400" />
          <span>Mac Keyboard Fingerprint Sensor</span>
        </div>

        {/* Fingerprint Visual Sensor */}
        <div className="relative flex items-center justify-center my-2">
          {/* Animated Glowing Sensor Rings */}
          <div
            className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
              state === 'VERIFIED'
                ? 'border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.85)] bg-emerald-950/40'
                : state === 'FAILED' || state === 'LOCKED'
                ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] bg-red-950/30'
                : state === 'PROMPTING' || state === 'VERIFYING'
                ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.6)] bg-emerald-950/20 animate-pulse'
                : 'border-neutral-700 bg-neutral-900/60'
            }`}
          >
            {/* Inner Ping Effect */}
            {(state === 'PROMPTING' || state === 'VERIFYING') && (
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-40 pointer-events-none" />
            )}

            {/* Central Icon */}
            {state === 'VERIFIED' ? (
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-scale-in" />
            ) : state === 'FAILED' || state === 'LOCKED' ? (
              <AlertTriangle className="w-16 h-16 text-red-400 animate-scale-in" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Fingerprint
                  className={`w-16 h-16 transition-colors duration-300 ${
                    state === 'PROMPTING' || state === 'VERIFYING'
                      ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                      : 'text-neutral-400'
                  }`}
                />
                {/* Laser Scanning Line */}
                {(state === 'PROMPTING' || state === 'VERIFYING') && (
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_rgba(52,211,153,1)] animate-bounce" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Status Feedback */}
        <div className="space-y-1 max-w-xs">
          <p className="text-xs font-bold text-white tracking-wide">
            {state === 'VERIFIED'
              ? 'Touch ID Confirmed • Access Granted'
              : state === 'PROMPTING'
              ? 'Waiting for Fingerprint...'
              : state === 'VERIFYING'
              ? 'Authenticating with Secure Enclave...'
              : state === 'FAILED'
              ? 'Fingerprint Not Verified'
              : state === 'LOCKED'
              ? 'Biometric Authentication Locked'
              : 'Touch ID Active'}
          </p>
          <p className="text-[11px] font-mono text-neutral-400 leading-snug">
            {statusMessage}
          </p>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && !isLocked && (
        <div className="p-3 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-[11px]">{errorMessage}</span>
          </div>
          <span className="text-[10px] font-mono text-red-300 whitespace-nowrap">
            {attemptsRemaining} left
          </span>
        </div>
      )}

      {/* Main Touch ID Trigger / Retry Action */}
      <div className="space-y-2">
        {!isLocked && state !== 'VERIFIED' && (
          <button
            onClick={() => {
              isExecutingRef.current = false;
              executeTouchId();
            }}
            disabled={state === 'PROMPTING' || state === 'VERIFYING'}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800/40 text-black font-extrabold text-xs transition shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {state === 'PROMPTING' || state === 'VERIFYING' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Prompt Active on Mac...</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4 text-black" />
                <span>Verify with Mac Touch ID</span>
              </>
            )}
          </button>
        )}

        {/* Side Action: Switch to Face ID Camera Scan */}
        <button
          onClick={onSwitchToFaceId}
          className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-semibold text-xs transition border border-neutral-700 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span>Switch to Camera Face ID</span>
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition border border-neutral-800 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel & Return</span>
        </button>

        <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>FIDO2 / Apple Silicon</span>
        </div>
      </div>
    </div>
  );
}
