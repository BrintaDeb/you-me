import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Share, PlusSquare, Check, Laptop } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import './PwaInstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isAlreadyInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;

  // 1. Check if running in standalone PWA mode (iOS, Android, Chrome OS, Mac/Windows PWA window)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone) return true;

  // 2. Check iOS Safari standalone property
  const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  if (isIosStandalone) return true;

  // 3. Check Android TWA / PWA referrer
  if (document.referrer.includes('android-app://')) return true;

  // 4. Check persistent storage flags
  if (localStorage.getItem('youandme_app_installed') === 'true') return true;
  if (localStorage.getItem('youandme_pwa_installed') === 'true') return true;

  return false;
};

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  // Always show on mobile, ipad or desktop until and unless already downloaded
  const [isVisible, setIsVisible] = useState(() => !isAlreadyInstalled());
  const [showInstructions, setShowInstructions] = useState(false);
  const [isStoryboardActive, setIsStoryboardActive] = useState(false);

  // Automatically suppress PWA prompt when user is viewing the 3D cinematic storyboard
  useEffect(() => {
    const target = document.getElementById('camera-journey');
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStoryboardActive(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAlreadyInstalled()) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      localStorage.setItem('youandme_app_installed', 'true');
      localStorage.setItem('youandme_pwa_installed', 'true');
      setIsVisible(false);
      setShowInstructions(false);
      triggerHaptic('success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const isIosOrIpad =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const handleInstallClick = async () => {
    triggerHaptic('medium');

    // On iOS / iPadOS, browsers cannot trigger programmatic install prompts;
    // they require the Share -> Add to Home Screen workflow
    if (isIosOrIpad) {
      setShowInstructions(true);
      return;
    }

    // If native browser prompt is available (Android / Chrome / Edge)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          localStorage.setItem('youandme_app_installed', 'true');
          localStorage.setItem('youandme_pwa_installed', 'true');
          setIsVisible(false);
          triggerHaptic('success');
          return;
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Native prompt error:', err);
        setShowInstructions(true);
        return;
      }
    }

    // Fallback for browsers without direct JS prompt trigger
    setShowInstructions(true);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowInstructions(false);
    triggerHaptic('light');
  };

  const handleMarkAsInstalled = () => {
    localStorage.setItem('youandme_app_installed', 'true');
    localStorage.setItem('youandme_pwa_installed', 'true');
    setIsVisible(false);
    setShowInstructions(false);
    triggerHaptic('success');
  };

  if (!isVisible) return null;

  return (
    <>
      <aside
        className={`pwa-prompt-banner${isStoryboardActive ? ' pwa-suppressed-storyboard' : ''}`}
        aria-label="Install Web Application"
      >
        <div className="pwa-ring-accent" aria-hidden="true" />
        <div className="pwa-prompt-content">
          <div className="pwa-prompt-icon">
            <Sparkles size={18} className="gold-icon" />
          </div>
          <div className="pwa-prompt-text">
            <div className="pwa-prompt-title-row">
              <span className="pwa-prompt-heart" aria-hidden="true">🧡</span>
              <strong className="pwa-prompt-title">
                Install <em>YOU &amp; ME</em> App
              </strong>
            </div>
            <span className="pwa-prompt-subtitle">
              Browse galleries &amp; proof heirloom a...
            </span>
          </div>
        </div>

        <div className="pwa-prompt-actions">
          <button
            type="button"
            className="pwa-install-btn"
            onClick={handleInstallClick}
          >
            <Download size={14} className="pwa-download-icon" /> INSTALL APP
          </button>

          <button
            type="button"
            className="pwa-dismiss-btn"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
          >
            <X size={16} />
          </button>
        </div>
      </aside>

      {/* Interactive Helper Modal for iOS / iPad or manual browser install */}
      {showInstructions && (
        <div className="pwa-instructions-overlay" onClick={() => setShowInstructions(false)}>
          <div
            className="pwa-instructions-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="How to install YOU & ME App"
          >
            <button
              type="button"
              className="pwa-modal-close-btn"
              onClick={() => setShowInstructions(false)}
              aria-label="Close instructions"
            >
              <X size={18} />
            </button>

            <div className="pwa-modal-header">
              <div className="pwa-modal-icon-badge">
                <Sparkles size={22} />
              </div>
              <h3 className="pwa-modal-title">Install YOU &amp; ME App</h3>
              <p className="pwa-modal-subtitle">
                Enjoy offline access to your heirloom wedding galleries, cinematic films, and client proofing.
              </p>
            </div>

            <div className="pwa-instructions-steps">
              {isIosOrIpad ? (
                <>
                  <div className="pwa-step">
                    <span className="pwa-step-num">1</span>
                    <div className="pwa-step-body">
                      <strong>Tap the Share button</strong>
                      <p>
                        Tap the <Share size={14} className="inline-icon" /> Share icon in Safari (at the bottom of your iPhone or top of iPad).
                      </p>
                    </div>
                  </div>

                  <div className="pwa-step">
                    <span className="pwa-step-num">2</span>
                    <div className="pwa-step-body">
                      <strong>Select &ldquo;Add to Home Screen&rdquo;</strong>
                      <p>
                        Scroll down the menu and tap <PlusSquare size={14} className="inline-icon" /> <strong>Add to Home Screen</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="pwa-step">
                    <span className="pwa-step-num">3</span>
                    <div className="pwa-step-body">
                      <strong>Tap &ldquo;Add&rdquo;</strong>
                      <p>Confirm by tapping &ldquo;Add&rdquo; in the top-right corner to launch anytime.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="pwa-step">
                    <span className="pwa-step-num">1</span>
                    <div className="pwa-step-body">
                      <strong>Install from Address Bar</strong>
                      <p>
                        Click the <Laptop size={14} className="inline-icon" /> <strong>Install</strong> icon (or <Download size={14} className="inline-icon" />) in your browser address bar.
                      </p>
                    </div>
                  </div>

                  <div className="pwa-step">
                    <span className="pwa-step-num">2</span>
                    <div className="pwa-step-body">
                      <strong>Confirm Installation</strong>
                      <p>Click &ldquo;Install&rdquo; in the prompt to add YOU &amp; ME directly to your desktop.</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pwa-modal-footer">
              <button
                type="button"
                className="btn btn-primary pwa-confirm-installed-btn"
                onClick={handleMarkAsInstalled}
              >
                <Check size={16} /> I&rsquo;ve Installed It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
