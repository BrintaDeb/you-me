import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Sliders
} from 'lucide-react';
import type { WeddingStory } from '../data/couplesData';
import { triggerHaptic } from '../utils/haptics';
import './CinemaWalkthroughModal.css';

interface CinemaWalkthroughModalProps {
  story: WeddingStory;
  isOpen: boolean;
  onClose: () => void;
}

const SPEED_OPTIONS = [
  { label: '3.5s', duration: 3500 },
  { label: '5.0s', duration: 5000 },
  { label: '7.5s', duration: 7500 }
];

export const CinemaWalkthroughModal: React.FC<CinemaWalkthroughModalProps> = ({
  story,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(1); // Default 5.0s
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const images = story.images;
  const currentSpeed = SPEED_OPTIONS[speedIndex].duration;

  // Next slide handler
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setProgress(0);
    startTimeRef.current = Date.now();
    triggerHaptic('light');
  }, [images.length]);

  // Prev slide handler
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setProgress(0);
    startTimeRef.current = Date.now();
    triggerHaptic('light');
  }, [images.length]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
    triggerHaptic('medium');
    startTimeRef.current = Date.now() - (progress / 100) * currentSpeed;
  }, [progress, currentSpeed]);

  // Cycle playback speed
  const cycleSpeed = () => {
    setSpeedIndex((prev) => (prev + 1) % SPEED_OPTIONS.length);
    setProgress(0);
    startTimeRef.current = Date.now();
    triggerHaptic('light');
  };

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
      triggerHaptic('light');
    } catch {
      // Fullscreen not permitted
    }
  }, []);

  // Auto-advance loop with progress bar
  useEffect(() => {
    if (!isOpen || !isPlaying || images.length <= 1) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    } else {
      startTimeRef.current = Date.now() - (progress / 100) * currentSpeed;
    }

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / currentSpeed) * 100);
      setProgress(pct);

      if (elapsed >= currentSpeed) {
        handleNext();
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, isPlaying, currentIndex, currentSpeed, images.length, handleNext, progress]);

  // Handle body scroll and fullscreen teardown
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Auto-hide controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3200);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, togglePlay, toggleFullscreen, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  // Determine unique Ken Burns animation class (4 cyclical variations)
  const kenBurnsVariant = `ken-burns-${currentIndex % 4}`;

  return (
    <div
      ref={containerRef}
      className={`cinema-modal-backdrop ${showControls ? 'controls-visible' : 'controls-hidden'}`}
      onMouseMove={handleMouseMove}
      role="dialog"
      aria-modal="true"
      aria-label={`Cinema Walkthrough: ${story.title}`}
    >
      {/* Cinematic Letterbox Top */}
      <div className="cinema-letterbox top" />

      {/* Top HUD Header */}
      <header className="cinema-hud-header">
        <div className="cinema-brand-title">
          <Sparkles size={14} className="gold-sparkle" />
          <span className="cinema-eyebrow">Cinema Walkthrough</span>
          <span className="cinema-story-name">{story.title}</span>
        </div>

        <div className="cinema-header-actions">
          <button
            type="button"
            className="cinema-action-btn"
            onClick={cycleSpeed}
            title="Adjust advance speed"
            aria-label={`Advance speed: ${SPEED_OPTIONS[speedIndex].label}`}
          >
            <Sliders size={16} />
            <span>{SPEED_OPTIONS[speedIndex].label}</span>
          </button>

          <button
            type="button"
            className="cinema-action-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            type="button"
            className="cinema-close-btn"
            onClick={onClose}
            title="Close Walkthrough (Esc)"
            aria-label="Close Cinema Walkthrough"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Cinema Viewport */}
      <div className="cinema-viewport">
        <div key={currentImage.id} className={`cinema-image-container ${kenBurnsVariant}`}>
          <img
            src={currentImage.url}
            alt={currentImage.alt}
            className="cinema-featured-image"
          />
        </div>

        {/* Previous / Next Touch Targets */}
        <button
          type="button"
          className="cinema-nav-touch prev"
          onClick={handlePrev}
          aria-label="Previous photograph"
        >
          <ChevronLeft size={36} />
        </button>

        <button
          type="button"
          className="cinema-nav-touch next"
          onClick={handleNext}
          aria-label="Next photograph"
        >
          <ChevronRight size={36} />
        </button>
      </div>

      {/* Bottom Letterbox & Controls */}
      <div className="cinema-letterbox bottom" />

      <footer className="cinema-hud-footer">
        {/* Progress Bar */}
        <div className="cinema-progress-track">
          <div
            className="cinema-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="cinema-footer-content">
          <div className="cinema-caption-meta">
            <span className="cinema-counter">
              {currentIndex + 1} <span className="dim">/ {images.length}</span>
            </span>
            <span className="cinema-caption-text">
              {currentImage.caption || `${story.title} — ${story.tagline}`}
            </span>
          </div>

          <div className="cinema-playback-controls">
            <button
              type="button"
              className="cinema-play-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause slideshow' : 'Resume slideshow'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
