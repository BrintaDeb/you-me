import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface UseSmoothScrollOptions {
  isPaused?: boolean;
}

export function useSmoothScroll({ isPaused = false }: UseSmoothScrollOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Only enable smooth momentum scroll on devices with fine pointer (mouse/trackpad), not touchscreens
    const hasFinePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      syncTouch: false, // Keep native touch momentum on touchscreens
    });

    lenisRef.current = lenis;

    // Attach to global window for external triggers (e.g. scroll-to-top)
    if (typeof window !== 'undefined') {
      (window as unknown as { __lenis: Lenis }).__lenis = lenis;
    }

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
    };
  }, []);

  // Handle modal pausing/resuming
  useEffect(() => {
    if (!lenisRef.current) return;

    if (isPaused) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [isPaused]);

  return lenisRef;
}
