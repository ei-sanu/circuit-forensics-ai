'use client';

// Futuristic Cyber Command Notification Sound Synthesizer using Web Audio API
class AudioAlertEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled() {
    return this.soundEnabled;
  }

  // 🔔 Futuristic Cyber Command Notification Sound (Crystal Harmonic Chime & Pulse)
  public playCriticalMatchAlert() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Master output gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35, now);
      masterGain.connect(ctx.destination);

      // --- Note 1: High-Tech Ascending Crystal Chime (587.33 Hz / D5 -> 880 Hz / A5) ---
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.linearRampToValueAtTime(0.4, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain1);
      gain1.connect(masterGain);

      osc1.start(now);
      osc1.stop(now + 0.45);

      // --- Note 2: Harmonic Sparkle Tone (1174.66 Hz / D6) ---
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.22); // E6

      gain2.gain.setValueAtTime(0.01, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.11);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc2.connect(gain2);
      gain2.connect(masterGain);

      osc2.start(now + 0.08);
      osc2.stop(now + 0.55);

      // --- Note 3: Confirmation Resolve Chime (1046.5 Hz / C6 -> 1567.98 Hz / G6) ---
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1046.5, now + 0.18); // C6
      osc3.frequency.exponentialRampToValueAtTime(1567.98, now + 0.32); // G6

      gain3.gain.setValueAtTime(0.01, now + 0.18);
      gain3.gain.linearRampToValueAtTime(0.35, now + 0.22);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

      osc3.connect(gain3);
      gain3.connect(masterGain);

      osc3.start(now + 0.18);
      osc3.stop(now + 0.75);

      // --- Subtle Sub-bass Resonance (80 Hz -> 50 Hz) ---
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(80, now);
      subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

      subGain.gain.setValueAtTime(0.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      subOsc.connect(subGain);
      subGain.connect(masterGain);

      subOsc.start(now);
      subOsc.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio alert could not be synthesized:', e);
    }
  }

  // Tactical Radar Sonar Click
  public playRadarPing() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1320, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      // AudioContext may require user gesture
    }
  }
}

export const audioAlert = new AudioAlertEngine();
