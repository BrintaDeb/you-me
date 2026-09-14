// Reference Music: "Indian Wedding Instrumental Music | wedding Instrumental"
// Artist: RA Entertainment
// Link: https://youtu.be/nR83Exjd4_4
// Audio-only implementation (no video rendered, pure background streaming)

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        config: {
          height?: string | number;
          width?: string | number;
          videoId: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState?: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
}

export interface AudioTrackInfo {
  title: string;
  artist: string;
  sourceUrl: string;
  volume: number;
  isPlaying: boolean;
  isDucked: boolean;
}

class AudioAtmosphereManager {
  private readonly videoId = 'nR83Exjd4_4';
  private player: YTPlayerInstance | null = null;
  private isPlayerReady = false;
  private isPlaying = true; // DEFAULT ON: Sound starts on page open
  private userExplicitlyMuted = false;
  private hasInteracted = false;
  private isDucked = false;
  private targetVolume = 8; // Ultra-soothing, subtle 8% background ambient ceiling (never overpowering)
  private currentVolume = 0;
  private fadeInterval: number | null = null;
  private listeners: Set<(playing: boolean) => void> = new Set();
  private isUsingFallback = false;

  // Fallback Web Audio Synthesizer (Acoustic Piano & Legato Violin)
  private fallbackCtx: AudioContext | null = null;
  private fallbackGain: GainNode | null = null;
  private fallbackTimer: number | null = null;
  private fallbackPhraseIdx = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initYouTubeAPI();
      this.setupAutoPlayUnlock();
    }
  }

  // Subscribe to playback status updates
  public subscribe(fn: (playing: boolean) => void): () => void {
    this.listeners.add(fn);
    fn(this.isPlaying);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.isPlaying));
  }

  // Ensure audio plays upon the very first user interaction if browser policy deferred initial autoplay
  private setupAutoPlayUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.hasInteracted) return;
      this.hasInteracted = true;

      if (this.isPlaying && !this.userExplicitlyMuted) {
        if (this.player && this.isPlayerReady) {
          try {
            const state = this.player.getPlayerState();
            if (state !== 1) {
              this.player.playVideo();
              this.fadeVolume(0, this.targetVolume, 2500);
            }
          } catch {
            this.start();
          }
        } else if (this.isUsingFallback && this.fallbackCtx) {
          if (this.fallbackCtx.state === 'suspended') {
            this.fallbackCtx.resume();
          }
        }
      }

      ['click', 'pointerdown', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, unlock);
      });
    };

    ['click', 'pointerdown', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlock, { once: true, passive: true });
    });
  }

  // Initialize YouTube IFrame API script & container
  private initYouTubeAPI() {
    try {
      // Ensure hidden container exists
      let container = document.getElementById('youandme-bg-audio-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'youandme-bg-audio-container';
        container.style.position = 'fixed';
        container.style.bottom = '-9999px';
        container.style.left = '-9999px';
        container.style.width = '200px';
        container.style.height = '200px';
        container.style.pointerEvents = 'none';
        container.style.opacity = '0.001';
        container.style.zIndex = '-999';
        container.setAttribute('aria-hidden', 'true');
        document.body.appendChild(container);
      }

      // If YT is already loaded
      if (window.YT && window.YT.Player) {
        this.createPlayer();
        return;
      }

      // Load YouTube API script
      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript?.parentNode?.insertBefore(tag, firstScript);
      }

      const prevOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevOnReady) prevOnReady();
        this.createPlayer();
      };
    } catch (err) {
      console.warn('YouTube IFrame API setup notice:', err);
    }
  }

  private createPlayer() {
    if (!window.YT || !window.YT.Player || this.player) return;

    try {
      this.player = new window.YT.Player('youandme-bg-audio-container', {
        height: '200',
        width: '200',
        videoId: this.videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          loop: 1,
          playlist: this.videoId,
        },
        events: {
          onReady: (event) => {
            this.isPlayerReady = true;
            this.player = event.target;
            this.player.setVolume(0);
            this.currentVolume = 0;

            // Start playing immediately on open
            if (this.isPlaying && !this.userExplicitlyMuted) {
              this.start();
            }
          },
          onStateChange: (event) => {
            // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
            if (event.data === 1 && !this.isPlaying) {
              this.isPlaying = true;
              this.notify();
            } else if (event.data === 2 && this.isPlaying && this.userExplicitlyMuted && !this.isDucked) {
              this.isPlaying = false;
              this.notify();
            }
          },
          onError: (event) => {
            console.warn('YouTube playback error, switching to acoustic duet fallback:', event.data);
            this.activateAcousticFallback();
          },
        },
      });
    } catch (err) {
      console.warn('Error creating YouTube player instance:', err);
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  // Start soothing playback with gentle volume fade-in
  public start() {
    this.userExplicitlyMuted = false;
    this.isPlaying = true;
    this.notify();

    if (this.isUsingFallback) {
      this.startAcousticFallback();
      return;
    }

    if (!this.player || !this.isPlayerReady) {
      // Set fallback timeout if YT takes longer than 3.5s to load
      window.setTimeout(() => {
        if (!this.isPlayerReady && this.isPlaying) {
          this.activateAcousticFallback();
        }
      }, 3500);
      return;
    }

    try {
      this.player.playVideo();
      // Gentle 3.5-second swell-in to ultra-soothing 8% volume ceiling
      this.fadeVolume(0, this.targetVolume, 3500);
    } catch (e) {
      console.warn('Could not start YouTube audio, launching fallback:', e);
      this.activateAcousticFallback();
    }
  }

  // Stop playback with gentle fade-out
  public stop() {
    this.userExplicitlyMuted = true;
    this.isPlaying = false;
    this.notify();

    if (this.isUsingFallback) {
      this.stopAcousticFallback();
      return;
    }

    if (this.player && this.isPlayerReady) {
      this.fadeVolume(this.currentVolume, 0, 400, () => {
        try {
          this.player?.pauseVideo();
        } catch {}
      });
    }
  }

  // Smooth volume interpolation
  private fadeVolume(from: number, to: number, durationMs: number, onComplete?: () => void) {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const steps = 25;
    const stepDuration = durationMs / steps;
    const stepDiff = (to - from) / steps;
    let current = from;
    let stepCount = 0;

    this.fadeInterval = window.setInterval(() => {
      stepCount++;
      current += stepDiff;
      this.currentVolume = Math.round(Math.max(0, Math.min(100, current)));

      if (this.player && this.isPlayerReady) {
        try {
          this.player.setVolume(this.currentVolume);
        } catch {}
      }

      if (stepCount >= steps) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        this.currentVolume = to;
        if (this.player && this.isPlayerReady) {
          try {
            this.player.setVolume(to);
          } catch {}
        }
        if (onComplete) onComplete();
      }
    }, stepDuration);
  }

  // Smart Ducking: Auto-fade when wedding film modals play
  public setDucked(duck: boolean) {
    if (!this.isPlaying) return;
    this.isDucked = duck;

    if (duck) {
      // Fade to 0 and pause
      this.fadeVolume(this.currentVolume, 0, 350, () => {
        try {
          if (this.player && this.isPlayerReady) {
            this.player.pauseVideo();
          }
        } catch {}
      });
    } else {
      // Resume and gently fade back up to soothing 8%
      try {
        if (this.player && this.isPlayerReady) {
          this.player.playVideo();
          this.fadeVolume(0, this.targetVolume, 1500);
        }
      } catch {}
    }
  }

  // Adjust volume manually
  public setVolume(vol: number) {
    this.targetVolume = Math.max(1, Math.min(100, vol));
    if (this.isPlaying && !this.isDucked && this.player && this.isPlayerReady) {
      this.player.setVolume(this.targetVolume);
      this.currentVolume = this.targetVolume;
    }
  }

  public getTrackInfo(): AudioTrackInfo {
    return {
      title: 'Indian Wedding Instrumental Music',
      artist: 'RA Entertainment',
      sourceUrl: 'https://youtu.be/nR83Exjd4_4',
      volume: this.currentVolume,
      isPlaying: this.isPlaying,
      isDucked: this.isDucked,
    };
  }

  public getStatus(): { isPlaying: boolean; isDucked: boolean } {
    return { isPlaying: this.isPlaying, isDucked: this.isDucked };
  }

  // ==========================================
  // ACOUSTIC DUET SYNTHESIS FALLBACK (Piano & Legato Violin)
  // ==========================================
  private activateAcousticFallback() {
    this.isUsingFallback = true;
    if (this.isPlaying) {
      this.startAcousticFallback();
    }
  }

  private initFallbackContext() {
    if (!this.fallbackCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.fallbackCtx = new AudioCtx();
    }
  }

  private startAcousticFallback() {
    try {
      this.initFallbackContext();
      if (!this.fallbackCtx) return;

      if (this.fallbackCtx.state === 'suspended') {
        this.fallbackCtx.resume();
      }

      const now = this.fallbackCtx.currentTime;
      this.fallbackGain = this.fallbackCtx.createGain();
      this.fallbackGain.gain.setValueAtTime(0, now);
      // Ultra-soothing volume level 0.05
      this.fallbackGain.gain.linearRampToValueAtTime(0.05, now + 3.0);
      this.fallbackGain.connect(this.fallbackCtx.destination);

      this.fallbackPhraseIdx = 0;
      this.playNextFallbackDuet();
    } catch (e) {
      console.warn('Fallback audio start error:', e);
    }
  }

  private stopAcousticFallback() {
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.fallbackGain && this.fallbackCtx) {
      const now = this.fallbackCtx.currentTime;
      this.fallbackGain.gain.cancelScheduledValues(now);
      this.fallbackGain.gain.linearRampToValueAtTime(0, now + 0.4);
    }
  }

  // Romantic Wedding Duet Progression (Canon in D / Wedding Vows)
  private playNextFallbackDuet() {
    if (!this.isPlaying || !this.fallbackCtx || !this.fallbackGain) return;

    const chords = [
      { root: 146.83, notes: [293.66, 369.99, 440.0], violin: 587.33 },  // D Major
      { root: 110.00, notes: [220.00, 277.18, 329.63], violin: 554.37 },  // A Major
      { root: 123.47, notes: [246.94, 293.66, 369.99], violin: 493.88 },  // B Minor
      { root: 92.50,  notes: [185.00, 220.00, 277.18], violin: 440.00 },  // F# Minor
      { root: 98.00,  notes: [196.00, 246.94, 293.66], violin: 392.00 },  // G Major
      { root: 146.83, notes: [293.66, 369.99, 440.0], violin: 369.99 },  // D Major
      { root: 98.00,  notes: [196.00, 246.94, 293.66], violin: 329.63 },  // G Major
      { root: 110.00, notes: [220.00, 277.18, 329.63], violin: 293.66 },  // A Major -> D
    ];

    const current = chords[this.fallbackPhraseIdx];
    const now = this.fallbackCtx.currentTime;

    // 1. Felt Acoustic Piano Chords
    current.notes.forEach((freq, idx) => {
      if (!this.fallbackCtx || !this.fallbackGain) return;
      const osc = this.fallbackCtx.createOscillator();
      const gain = this.fallbackCtx.createGain();
      const filter = this.fallbackCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08); // Arpeggiated felt touch

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.fallbackGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + 3.4);
    });

    // 2. Legato Expressive Violin Melody
    const violinOsc = this.fallbackCtx.createOscillator();
    const violinGain = this.fallbackCtx.createGain();
    const violinFilter = this.fallbackCtx.createBiquadFilter();
    const vibrato = this.fallbackCtx.createOscillator();
    const vibratoGain = this.fallbackCtx.createGain();

    violinOsc.type = 'sawtooth';
    violinOsc.frequency.setValueAtTime(current.violin, now);

    // Warm 5.5Hz vibrato
    vibrato.frequency.setValueAtTime(5.5, now);
    vibratoGain.gain.setValueAtTime(3.5, now);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(violinOsc.frequency);

    violinFilter.type = 'lowpass';
    violinFilter.frequency.setValueAtTime(2200, now);
    violinFilter.Q.setValueAtTime(1.8, now);

    // Gentle bowing envelope
    violinGain.gain.setValueAtTime(0, now);
    violinGain.gain.linearRampToValueAtTime(0.05, now + 0.4);
    violinGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    violinOsc.connect(violinFilter);
    violinFilter.connect(violinGain);
    violinGain.connect(this.fallbackGain);

    vibrato.start(now);
    violinOsc.start(now);
    vibrato.stop(now + 3.3);
    violinOsc.stop(now + 3.3);

    this.fallbackTimer = window.setTimeout(() => {
      if (this.isPlaying) {
        this.fallbackPhraseIdx = (this.fallbackPhraseIdx + 1) % chords.length;
        this.playNextFallbackDuet();
      }
    }, 3200);
  }
}

export const audioAtmosphere = new AudioAtmosphereManager();
