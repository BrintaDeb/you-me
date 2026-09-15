/**
 * Ambient Lighting & Specular Glassmorphism Controller
 * Dynamically projects subtle specular reflections onto luxury glassmorphic surfaces:
 * - Desktop: Softly tracks cursor position across viewport
 * - Mobile: Uses DeviceOrientationEvent with damped, strictly clamped tilt (±15° max -> ±8% specular shift)
 * 
 * Sets CSS custom properties on document.documentElement:
 * --specular-x (default: 50%)
 * --specular-y (default: 50%)
 * --tilt-x (default: 0px)
 * --tilt-y (default: 0px)
 */

class SpecularLightingController {
  private isInitialized = false;
  private rafId: number | null = null;
  private currentX = 50;
  private currentY = 50;
  private targetX = 50;
  private targetY = 50;

  // Desktop: Smooth pointer tracking
  private handlePointerMove = (e: PointerEvent): void => {
    const xPct = Math.round((e.clientX / window.innerWidth) * 100);
    const yPct = Math.round((e.clientY / window.innerHeight) * 100);
    this.targetX = Math.max(10, Math.min(90, xPct));
    this.targetY = Math.max(10, Math.min(90, yPct));
    this.scheduleRender();
  };

  // Mobile: Gyroscope tilt with gentle damping and strict clamping
  private handleDeviceOrientation = (e: DeviceOrientationEvent): void => {
    if (e.gamma === null || e.beta === null) return;

    // Gamma: left to right (-90 to 90). Beta: front to back (-180 to 180).
    // Strictly clamp to +/- 15 deg for an ultra-subtle, non-distracting highlight
    const clampedGamma = Math.max(-15, Math.min(15, e.gamma));
    const clampedBeta = Math.max(-15, Math.min(15, e.beta - 45)); // assume ~45deg typical phone viewing angle

    // Map to 50% +/- 8%
    this.targetX = Math.round(50 + (clampedGamma / 15) * 8);
    this.targetY = Math.round(50 + (clampedBeta / 15) * 8);
    this.scheduleRender();
  };

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Check motion reduction preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--specular-x', '50%');
      document.documentElement.style.setProperty('--specular-y', '30%');
      return;
    }

    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });

    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.handleDeviceOrientation, { passive: true });
    }

    this.scheduleRender();
  }

  public destroy(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('pointermove', this.handlePointerMove);

    if ('DeviceOrientationEvent' in window) {
      window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.isInitialized = false;
  }

  private scheduleRender(): void {
    if (this.rafId !== null) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;

      // Linear interpolation for silky damping
      this.currentX += (this.targetX - this.currentX) * 0.12;
      this.currentY += (this.targetY - this.currentY) * 0.12;

      const roundedX = Math.round(this.currentX * 10) / 10;
      const roundedY = Math.round(this.currentY * 10) / 10;

      document.documentElement.style.setProperty('--specular-x', `${roundedX}%`);
      document.documentElement.style.setProperty('--specular-y', `${roundedY}%`);
      
      const tiltX = Math.round((this.currentX - 50) * 0.2);
      const tiltY = Math.round((this.currentY - 50) * 0.2);
      document.documentElement.style.setProperty('--specular-tilt-x', `${tiltX}px`);
      document.documentElement.style.setProperty('--specular-tilt-y', `${tiltY}px`);

      // Continue animating if target is still slightly offset
      if (Math.abs(this.targetX - this.currentX) > 0.1 || Math.abs(this.targetY - this.currentY) > 0.1) {
        this.scheduleRender();
      }
    });
  }
}

export const specularLighting = new SpecularLightingController();
