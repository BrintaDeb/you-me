import React, { useState, useEffect, useRef } from 'react';
import './HeartCursor.css';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const HeartCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number | null>(null);

  const heartRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable custom cursor on devices with fine pointer (mouse/trackpad), not touchscreens
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    // Apply custom cursor class to document body
    document.documentElement.classList.add('custom-heart-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      if (!target || !(target instanceof Element) || typeof target.closest !== 'function') {
        setIsHovered(false);
        setIsTextInput(false);
        return;
      }

      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        (target as HTMLElement).isContentEditable;
      setIsTextInput(isInput);

      const clickable = target.closest(
        'a, button, [role="button"], .clickable, .gallery-item, .filmstrip-frame, input[type="range"]'
      );
      setIsHovered(!!clickable && !isInput);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsPressed(true);

      // Clean, elegant single ripple on click
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

    // Ultra-smooth lerp loop for the trailing glass ring
    const renderLoop = () => {
      // Main heart locks directly to mouse position for instant, razor-sharp response
      if (heartRef.current) {
        heartRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Smooth trailing ring follows with fluid damping
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.16;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
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
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="clean-cursor-container" aria-hidden="true">
      {/* 1. Trailing Elegant Glass Aura Ring */}
      <div
        ref={ringRef}
        className={`clean-cursor-ring ${isHovered ? 'is-hovered' : ''} ${
          isPressed ? 'is-pressed' : ''
        } ${isTextInput ? 'is-text-input' : ''}`}
      />

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
