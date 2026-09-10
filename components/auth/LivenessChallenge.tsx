'use client';

import React from 'react';
import { Shield, CheckCircle2, Scan, Sparkles, UserCheck } from 'lucide-react';

interface LivenessChallengeProps {
  currentStep: 'position' | 'scan' | 'verifying' | 'complete';
  scanProgress?: number;
}

export function LivenessChallenge({ currentStep }: LivenessChallengeProps) {
  return (
    <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3 shadow-md backdrop-blur-md text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-neutral-300" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
            Live Optical Scan Protocol
          </span>
        </div>
        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
          1:1 Direct Recognition
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-medium font-mono">
        {/* Step 1: Align */}
        <div
          className={`p-2 rounded-xl border transition-all duration-200 ${
            currentStep === 'position'
              ? 'bg-neutral-900 border-white/40 text-white shadow-sm animate-pulse'
              : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
          }`}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            {currentStep !== 'position' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Scan className="w-3.5 h-3.5 text-neutral-200 animate-pulse" />
            )}
            <span className="font-bold">1. Align</span>
          </div>
          <p className="text-[9px] leading-tight opacity-80">
            {currentStep !== 'position' ? 'Face Locked' : 'Center Face'}
          </p>
        </div>

        {/* Step 2: Optical Scan */}
        <div
          className={`p-2 rounded-xl border transition-all duration-200 ${
            currentStep === 'scan'
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-sm animate-pulse'
              : currentStep === 'verifying' || currentStep === 'complete'
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
          }`}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            {currentStep === 'verifying' || currentStep === 'complete' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <UserCheck className={`w-3.5 h-3.5 ${currentStep === 'scan' ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
            )}
            <span className="font-bold">2. Optical Scan</span>
          </div>
          <p className="text-[9px] leading-tight opacity-80">
            {currentStep === 'verifying' || currentStep === 'complete'
              ? 'Scan Complete'
              : currentStep === 'scan'
              ? 'Direct Scanning'
              : 'Awaiting Lock'}
          </p>
        </div>

        {/* Step 3: 1:1 Match */}
        <div
          className={`p-2 rounded-xl border transition-all duration-200 ${
            currentStep === 'verifying'
              ? 'bg-neutral-900 border-emerald-500/50 text-emerald-200 shadow-sm animate-pulse'
              : currentStep === 'complete'
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
          }`}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            {currentStep === 'complete' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Sparkles className={`w-3.5 h-3.5 ${currentStep === 'verifying' ? 'text-emerald-400 animate-spin' : 'text-neutral-500'}`} />
            )}
            <span className="font-bold">3. 1:1 Match</span>
          </div>
          <p className="text-[9px] leading-tight opacity-80">
            {currentStep === 'complete'
              ? 'Verified'
              : currentStep === 'verifying'
              ? 'Cosine Match'
              : 'AES Vault'}
          </p>
        </div>
      </div>
    </div>
  );
}
