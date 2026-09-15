/**
 * Safe mobile haptic feedback utility
 * Gracefully no-ops on desktop or unsupported devices
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'selection' | 'pageFlip';

export const triggerHaptic = (pattern: HapticPattern = 'light'): void => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (pattern) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'selection':
        navigator.vibrate(14);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'pageFlip':
        navigator.vibrate([10, 30, 15]);
        break;
      case 'success':
        navigator.vibrate([15, 40, 25]);
        break;
      case 'warning':
        navigator.vibrate([30, 50, 30]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch {
    // Silently ignore browser vibration restrictions
  }
};
