'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Scan,
  ShieldCheck,
  Eye,
  Lock,
  Camera,
  Sparkles,
  Users,
  SunMedium,
  Move,
  Clock,
} from 'lucide-react';
import { BiometricScannerState } from '@/lib/biometric';

export type { BiometricScannerState };

interface FaceGuideProps {
  state: BiometricScannerState;
  statusMessage?: string;
  progress?: number;
  timeRemaining?: number;
  qualityAlert?: string | null;
  directionalCue?: 'LEFT' | 'RIGHT' | 'TOO_CLOSE' | 'TOO_FAR' | 'PERFECT' | 'NO_FACE';
  isFlashing?: boolean;
}

export function FaceGuide({
  state,
  statusMessage,
  progress = 0,
  timeRemaining,
  qualityAlert,
  directionalCue = 'PERFECT',
  isFlashing = false,
}: FaceGuideProps) {
  // Border & Glow styling matching the biometric state machine
  const getBorderColor = () => {
    switch (state) {
      case 'VERIFIED':
      case 'CAPTURED':
        return 'border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.75)]';
      case 'FAILED':
      case 'MULTIPLE_FACES':
      case 'LOCKED':
        return 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]';
      case 'READY':
      case 'STABILIZING':
      case 'GOOD_POSITION':
        return 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.6)] animate-pulse';
      case 'CAPTURING':
        return 'border-white shadow-[0_0_40px_rgba(255,255,255,0.95)]';
      case 'VERIFYING':
      case 'LIVENESS':
      case 'LIVENESS_CHECK':
        return 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)] animate-pulse';
      case 'FACE_DETECTED':
      case 'ANALYZING':
        return 'border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]';
      case 'TOO_FAR':
      case 'TOO_CLOSE':
      case 'OFF_CENTER':
      case 'POOR_LIGHTING':
      case 'ALIGNING':
        return 'border-amber-400 border-dashed shadow-[0_0_20px_rgba(251,191,36,0.4)]';
      case 'SEARCHING':
      case 'INITIALIZING':
      case 'IDLE':
      default:
        return 'border-neutral-500/60 border-dashed';
    }
  };

  const getStatusIcon = () => {
    switch (state) {
      case 'VERIFIED':
      case 'CAPTURED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'FAILED':
      case 'MULTIPLE_FACES':
      case 'LOCKED':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      case 'POOR_LIGHTING':
        return <SunMedium className="w-3.5 h-3.5 text-amber-400" />;
      case 'TOO_FAR':
      case 'TOO_CLOSE':
      case 'OFF_CENTER':
      case 'ALIGNING':
        return <Move className="w-3.5 h-3.5 text-amber-400" />;
      case 'STABILIZING':
      case 'READY':
      case 'CAPTURING':
      case 'GOOD_POSITION':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />;
      case 'LIVENESS':
      case 'LIVENESS_CHECK':
        return <Eye className="w-3.5 h-3.5 text-emerald-400" />;
      case 'VERIFYING':
        return <Lock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />;
      default:
        return (
          <span
            className={`w-2 h-2 rounded-full ${
              state === 'FACE_DETECTED'
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-amber-400 animate-pulse'
            }`}
          />
        );
    }
  };

  const isGreenState =
    progress >= 20 ||
    state === 'READY' ||
    state === 'GOOD_POSITION' ||
    state === 'STABILIZING' ||
    state === 'CAPTURING' ||
    state === 'LIVENESS' ||
    state === 'LIVENESS_CHECK' ||
    state === 'VERIFYING' ||
    state === 'VERIFIED';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
      {/* Subtle Capture Flash Effect */}
      {(isFlashing || state === 'CAPTURING') && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] transition-opacity duration-300 z-30 pointer-events-none" />
      )}

      {/* Central Biometric Head Reticle */}
      <div className="relative w-52 h-64 sm:w-60 sm:h-72 flex items-center justify-center transition-all duration-300">
        {/* Real-time Time Remaining Pill over Reticle */}
        {isGreenState && timeRemaining !== undefined && timeRemaining > 0 && state !== 'VERIFIED' && (
          <div className="absolute top-2 px-3 py-1 rounded-full bg-black/90 border border-emerald-400 text-emerald-300 font-mono text-[11px] font-extrabold shadow-lg z-20 flex items-center gap-1.5 backdrop-blur-md animate-pulse">
            <Clock className="w-3 h-3 text-emerald-400 animate-spin" />
            <span>HOLD STILL: {timeRemaining.toFixed(1)}s</span>
          </div>
        )}

        {/* Animated Face Oval Guide */}
        <div
          className={`w-full h-full rounded-[48%] border-2 transition-all duration-300 relative flex items-center justify-center ${getBorderColor()}`}
        >
          {/* Tactical Corner HUD Brackets */}
          <div className={`absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 rounded-tl transition-colors ${isGreenState ? 'border-emerald-400' : 'border-white/80'}`} />
          <div className={`absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 rounded-tr transition-colors ${isGreenState ? 'border-emerald-400' : 'border-white/80'}`} />
          <div className={`absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 rounded-bl transition-colors ${isGreenState ? 'border-emerald-400' : 'border-white/80'}`} />
          <div className={`absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 rounded-br transition-colors ${isGreenState ? 'border-emerald-400' : 'border-white/80'}`} />

          {/* Active Scanning Laser Beam */}
          {(state === 'LIVENESS_CHECK' ||
            state === 'LIVENESS' ||
            state === 'VERIFYING' ||
            state === 'STABILIZING' ||
            state === 'GOOD_POSITION' ||
            state === 'READY') && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.9)] animate-bounce" />
          )}

          {/* Success State Overlay */}
          {(state === 'VERIFIED' || state === 'CAPTURED') && (
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl animate-scale-in z-20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          )}

          {/* Failure State Overlay */}
          {(state === 'FAILED' || state === 'LOCKED') && (
            <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl animate-scale-in z-20">
              <AlertTriangle className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Real-Time Circular Progress Ring: Driven by Actual Stability State */}
        <div className="absolute -inset-3.5 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              className="stroke-neutral-800/50 fill-none"
              strokeWidth="4"
            />
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              className={`fill-none transition-all duration-200 ${
                isGreenState
                  ? 'stroke-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                  : 'stroke-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
              }`}
              strokeWidth="4.5"
              strokeDasharray="300"
              strokeDashoffset={300 - (300 * Math.min(100, Math.max(0, progress))) / 100}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Real-time Dynamic Precautions & Direction Indicators */}
      <div className="mt-3 flex flex-col items-center gap-1.5 z-20">
        {directionalCue === 'RIGHT' && (
          <div className="px-3.5 py-1 rounded-full bg-amber-500/95 text-black font-mono text-[11px] font-extrabold shadow-lg animate-bounce flex items-center gap-1.5 backdrop-blur-md border border-amber-300">
            <span>&larr; Move Face Slightly Right</span>
          </div>
        )}

        {directionalCue === 'LEFT' && (
          <div className="px-3.5 py-1 rounded-full bg-amber-500/95 text-black font-mono text-[11px] font-extrabold shadow-lg animate-bounce flex items-center gap-1.5 backdrop-blur-md border border-amber-300">
            <span>Move Face Slightly Left &rarr;</span>
          </div>
        )}

        {directionalCue === 'TOO_CLOSE' && (
          <div className="px-3.5 py-1 rounded-full bg-amber-500/95 text-black font-mono text-[11px] font-extrabold shadow-lg animate-pulse flex items-center gap-1.5 backdrop-blur-md border border-amber-300">
            <span>&darr; Move Slightly Back From Camera</span>
          </div>
        )}

        {directionalCue === 'TOO_FAR' && (
          <div className="px-3.5 py-1 rounded-full bg-amber-500/95 text-black font-mono text-[11px] font-extrabold shadow-lg animate-pulse flex items-center gap-1.5 backdrop-blur-md border border-amber-300">
            <span>&uarr; Move Slightly Closer</span>
          </div>
        )}

        {qualityAlert && !['TOO_CLOSE', 'TOO_FAR', 'LEFT', 'RIGHT'].includes(directionalCue) && (
          <div className="px-3.5 py-1 rounded-full bg-amber-500/95 text-black font-mono text-[10px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md border border-amber-300/60">
            <AlertTriangle className="w-3.5 h-3.5 text-black shrink-0" />
            <span>{qualityAlert}</span>
          </div>
        )}

        {isGreenState && !qualityAlert && (
          <div className="px-3.5 py-1 rounded-full bg-emerald-500/95 text-white font-mono text-[11px] font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 backdrop-blur-md border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>
              {timeRemaining !== undefined && timeRemaining > 0
                ? `Hold Position • Scanning: ${timeRemaining.toFixed(1)}s (${Math.round(progress)}%)`
                : `Optimal Alignment • Verifying (${Math.round(progress)}%)`}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Tactical Status Readout */}
      <div className="mt-2 px-4 py-1.5 rounded-full bg-neutral-950/90 border border-neutral-800 backdrop-blur-md text-white font-mono text-[11px] font-medium flex items-center gap-2 shadow-xl max-w-sm text-center">
        {getStatusIcon()}
        <span className="truncate">{statusMessage || 'Optical scanner active...'}</span>
      </div>
    </div>
  );
}
