import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import './PwaInstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('youandme_pwa_dismissed') === 'true';
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    triggerHaptic('medium');
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      triggerHaptic('success');
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('youandme_pwa_dismissed', 'true');
    triggerHaptic('light');
  };

  if (!isVisible || !deferredPrompt) return null;

  return (
    <aside className="pwa-prompt-banner" aria-label="Install Web Application">
      <div className="pwa-prompt-content">
        <div className="pwa-prompt-icon">
          <Sparkles size={18} className="gold-icon" />
        </div>
        <div className="pwa-prompt-text">
          <strong>Install YOU &amp; ME App</strong>
          <span>Browse galleries &amp; proof heirloom albums offline on your device.</span>
        </div>
      </div>

      <div className="pwa-prompt-actions">
        <button
          type="button"
          className="btn btn-primary pwa-install-btn"
          onClick={handleInstallClick}
        >
          <Download size={14} /> Install App
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
  );
};
