/**
 * Web Audio API Synthesized Micro-Acoustic Feedback
 * Provides zero-asset, ultra-lightweight luxury audio cues:
 * - Mechanical camera shutter click (for photo favoriting)
 * - Soft paper/velvet rustle (for album spread flipping)
 * - Gentle harmonic bell chime (for theme switching)
 */

class AcousticFeedbackManager {
  private ctx: AudioContext | null = null;
  private isEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('youandme_acoustic_fx');
      this.isEnabled = saved !== 'false';
    }
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioContextClass();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('youandme_acoustic_fx', enabled ? 'true' : 'false');
    } catch {}
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Delicate mechanical camera shutter click (Leica/Hasselblad style double-curtain transient)
   */
  public playShutterClick(): void {
    if (!this.isEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Click 1: First curtain travel & mirror slap
      this.renderShutterImpulse(ctx, now, 0.05, 1200);

      // Click 2: Second curtain closure (40ms later)
      this.renderShutterImpulse(ctx, now + 0.045, 0.04, 1800);
    } catch {
      // Gracefully ignore audio synthesis errors
    }
  }

  private renderShutterImpulse(ctx: AudioContext, time: number, gainValue: number, filterFreq: number) {
    // Generate 15ms white noise buffer for mechanical click
    const bufferSize = Math.floor(ctx.sampleRate * 0.018);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, time);
    filter.Q.setValueAtTime(2.5, time);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gainValue, time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.018);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.02);
  }

  /**
   * Soft archival paper / velvet book spread rustle (for album page turning)
   */
  public playPaperRustle(): void {
    if (!this.isEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.16;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Soft pink noise filter
        output[i] = (lastOut + (0.04 * white)) / 1.04;
        lastOut = output[i];
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, now);
      filter.frequency.linearRampToValueAtTime(1400, now + 0.08);
      filter.frequency.exponentialRampToValueAtTime(400, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration + 0.01);
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Gentle dual-sine harmonic chime (for theme toggling & confirmations)
   */
  public playThemeChime(): void {
    if (!this.isEnabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25]; // C5 & E5 harmonic interval

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.03);
        gain.gain.linearRampToValueAtTime(0.035, now + idx * 0.03 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.36);
      });
    } catch {
      // Ignore audio synthesis errors
    }
  }
}

export const acousticFeedback = new AcousticFeedbackManager();
