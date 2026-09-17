import React, { useState, useEffect, useRef } from 'react';
import './HeartCursor.css';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

interface TrailHeart {
  id: number;
  x: number;
  y: number;
  rotate: number;
}

export type CursorMode = 'default' | 'play' | 'expand' | 'story' | 'drag' | 'magnetic';

export const HeartCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>('default');
  const [cursorLabel, setCursorLabel] = useState<string>('');
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const [trailHearts, setTrailHearts] = useState<TrailHeart[]>([]);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const glowPos = useRef({ x: -100, y: -100 });
  const magneticElRef = useRef<HTMLElement | null>(null);
  const lastMagneticElRef = useRef<HTMLElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  const heartRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Ref to track latest mode without closure stale state in rAF loop
  const cursorModeRef = useRef<CursorMode>('default');

  useEffect(() => {
    // Only enable custom cursor on devices with fine pointer (mouse/trackpad), not touchscreens
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Apply custom cursor class to document body
    document.documentElement.classList.add('custom-heart-cursor-active');

    let lastX = -100;
    let lastY = -100;
    let lastTime = performance.now();
    let velocityScale = 1;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;

      // Scale heart size based on velocity (clamped 1x – 1.35x)
      velocityScale = Math.min(1.35, 1 + speed * 0.3);

      mousePos.current = { x: e.clientX, y: e.clientY };
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;

      if (!isVisible) setIsVisible(true);

      const target = e.target;
      if (!target || !(target instanceof Element) || typeof target.closest !== 'function') {
        setIsHovered(false);
        setIsTextInput(false);
        if (cursorModeRef.current !== 'default') {
          cursorModeRef.current = 'default';
          setCursorMode('default');
          setCursorLabel('');
        }
        if (magneticElRef.current) {
          magneticElRef.current.style.transform = '';
          magneticElRef.current = null;
        }
        return;
      }

      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        (target as HTMLElement).isContentEditable;
      setIsTextInput(isInput);

      // 1. Check for specific context badges (play, expand, story, drag)
      const explicitCursorEl = target.closest<HTMLElement>('[data-cursor]');
      const playTarget = target.closest<HTMLElement>(
        '[data-cursor="play"], .wedding-film-card, .filmstrip-frame, .film-trailer-card, .play-film-btn'
      );
      const expandTarget = target.closest<HTMLElement>(
        '[data-cursor="expand"], .portfolio-grid-item, .gallery-item, .gallery-photo, .lightbox-trigger'
      );
      const storyTarget = target.closest<HTMLElement>(
        '[data-cursor="story"], .story-card, .couple-card, .featured-story-card, .timeline-story-node'
      );
      const dragTarget = target.closest<HTMLElement>(
        '[data-cursor="drag"], .drag-scroll-track, .filmstrip-slider'
      );
      const magneticTarget = target.closest<HTMLElement>(
        '[data-magnetic], .magnetic-btn, .btn-magnetic'
      );

      // Handle magnetic button release
      if (lastMagneticElRef.current && lastMagneticElRef.current !== magneticTarget) {
        lastMagneticElRef.current.style.transform = '';
        lastMagneticElRef.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        const el = lastMagneticElRef.current;
        setTimeout(() => {
          if (el) el.style.transition = '';
        }, 300);
      }
      magneticElRef.current = magneticTarget;
      lastMagneticElRef.current = magneticTarget;

      let detectedMode: CursorMode = 'default';
      let detectedLabel = '';

      if (isInput) {
        detectedMode = 'default';
      } else if (playTarget) {
        detectedMode = 'play';
        detectedLabel = playTarget.getAttribute('data-cursor-label') || 'PLAY FILM';
      } else if (expandTarget) {
        detectedMode = 'expand';
        detectedLabel = expandTarget.getAttribute('data-cursor-label') || 'EXPAND';
      } else if (storyTarget) {
        detectedMode = 'story';
        detectedLabel = storyTarget.getAttribute('data-cursor-label') || 'READ STORY';
      } else if (dragTarget) {
        detectedMode = 'drag';
        detectedLabel = dragTarget.getAttribute('data-cursor-label') || 'DRAG';
      } else if (explicitCursorEl) {
        const customType = explicitCursorEl.getAttribute('data-cursor') as CursorMode;
        if (customType) {
          detectedMode = customType;
          detectedLabel = explicitCursorEl.getAttribute('data-cursor-label') || '';
        }
      } else if (magneticTarget) {
        detectedMode = 'magnetic';
      }

      if (cursorModeRef.current !== detectedMode) {
        cursorModeRef.current = detectedMode;
        setCursorMode(detectedMode);
      }
      setCursorLabel(detectedLabel);

      const clickable = target.closest(
        'a, button, [role="button"], .clickable, .gallery-item, .filmstrip-frame, input[type="range"], [data-cursor]'
      );
      setIsHovered((!!clickable || detectedMode !== 'default') && !isInput);

      // Emit trail micro-heart if moving fast enough & motion allowed
      if (!prefersReduced && speed > 0.8 && detectedMode === 'default') {
        const trail: TrailHeart = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          rotate: Math.round((Math.random() - 0.5) * 30),
        };
        setTrailHearts(prev => [...prev.slice(-4), trail]);
        setTimeout(() => {
          setTrailHearts(prev => prev.filter(t => t.id !== trail.id));
        }, 420);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsPressed(true);

      // Clean, elegant ripple on click
      const newRipple: ClickRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };

      setRipples(prev => [...prev.slice(-3), newRipple]);

      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 500);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Ultra-smooth lerp loop for the trailing glass ring, ambient luminescence & magnetic physics
    const renderLoop = () => {
      // Main heart locks directly to mouse position for instant, razor-sharp response
      if (heartRef.current) {
        const isSpecialBadge = cursorModeRef.current !== 'default' && cursorModeRef.current !== 'magnetic';
        const opacity = isSpecialBadge ? 0 : isTextInput ? 0.45 : 1;
        heartRef.current.style.opacity = `${opacity}`;
        heartRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%) scale(${velocityScale})`;
      }

      // Magnetic attraction calculations
      let targetX = mousePos.current.x;
      let targetY = mousePos.current.y;

      if (magneticElRef.current) {
        const rect = magneticElRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distFromCenter = Math.hypot(mousePos.current.x - centerX, mousePos.current.y - centerY);

        // Magnetic attraction radius (pull ring toward element center)
        if (distFromCenter < 90) {
          targetX = centerX + (mousePos.current.x - centerX) * 0.35;
          targetY = centerY + (mousePos.current.y - centerY) * 0.35;

          // Apply subtle physical elasticity translation to the button itself
          const pullX = (mousePos.current.x - centerX) * 0.22;
          const pullY = (mousePos.current.y - centerY) * 0.22;
          magneticElRef.current.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
        }
      }

      // Smooth trailing ring follows with fluid damping
      ringPos.current.x += (targetX - ringPos.current.x) * 0.18;
      ringPos.current.y += (targetY - ringPos.current.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Context Badge moves synchronously with ringPos for seamless tactile stability
      if (badgeRef.current) {
        badgeRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Ambient champagne glow floats with dreamy gentle inertia
      glowPos.current.x += (mousePos.current.x - glowPos.current.x) * 0.08;
      glowPos.current.y += (mousePos.current.y - glowPos.current.y) * 0.08;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowPos.current.x}px, ${glowPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    animFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      document.documentElement.classList.remove('custom-heart-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (magneticElRef.current) magneticElRef.current.style.transform = '';
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isVisible, isTextInput]);

  if (!isVisible) return null;

  const hasContextBadge = cursorMode !== 'default' && cursorMode !== 'magnetic';

  return (
    <div className="clean-cursor-container" aria-hidden="true">
      {/* 0. Ambient Champagne Luminescence Halo */}
      <div
        ref={glowRef}
        className={`clean-cursor-glow ${isHovered ? 'is-hovered' : ''} ${
          hasContextBadge ? 'badge-active' : ''
        }`}
      />

      {/* 1. Trailing Elegant Glass Aura Ring */}
      <div
        ref={ringRef}
        className={`clean-cursor-ring ${isHovered ? 'is-hovered' : ''} ${
          isPressed ? 'is-pressed' : ''
        } ${isTextInput ? 'is-text-input' : ''} mode-${cursorMode}`}
      />

      {/* 1.5 Context-Aware Luxury Badge (Play, Expand, Story, Drag) */}
      <div
        ref={badgeRef}
        className={`clean-cursor-badge ${hasContextBadge ? 'is-visible' : ''} mode-${cursorMode} ${
          isPressed ? 'is-pressed' : ''
        }`}
      >
        <div className="cursor-badge-inner">
          {cursorMode === 'play' && (
            <div className="cursor-badge-icon play-icon">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}

          {cursorMode === 'expand' && (
            <div className="cursor-badge-icon expand-icon">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </div>
          )}

          {cursorMode === 'story' && (
            <div className="cursor-badge-icon story-icon">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          )}

          {cursorMode === 'drag' && (
            <div className="cursor-badge-icon drag-icon">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18-6-6 6-6M15 6l6 6-6 6" />
              </svg>
            </div>
          )}

          {cursorLabel && <span className="cursor-badge-text">{cursorLabel}</span>}
        </div>
      </div>

      {/* 2. Precision Heart Pointer */}
      <div
        ref={heartRef}
        className={`clean-cursor-heart ${isHovered ? 'is-hovered' : ''} ${
          isPressed ? 'is-pressed' : ''
        } ${isTextInput ? 'is-text-input' : ''}`}
      >
        <svg viewBox="0 0 24 24" className="clean-heart-svg">
          <defs>
            <linearGradient id="cleanHeartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6D3" />
              <stop offset="45%" stopColor="#C8A46B" />
              <stop offset="90%" stopColor="#E5253A" />
            </linearGradient>
          </defs>
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="url(#cleanHeartGradient)"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="0.8"
          />
        </svg>
      </div>

      {/* 2.5 Trail micro-hearts */}
      {cursorMode === 'default' &&
        trailHearts.map(t => (
          <div
            key={t.id}
            className="cursor-trail-heart"
            style={{
              transform: `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -50%) rotate(${t.rotate}deg)`,
            }}
          >
            <svg viewBox="0 0 24 24" width="10" height="10">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="rgba(200, 164, 107, 0.75)"
              />
            </svg>
          </div>
        ))}

      {/* 3. Subtle Click Shockwave Ripple */}
      {ripples.map(r => (
        <div
          key={r.id}
          className="clean-cursor-ripple"
          style={{
            transform: `translate3d(${r.x}px, ${r.y}px, 0) translate(-50%, -50%)`,
          }}
        />
      ))}
    </div>
  );
};
