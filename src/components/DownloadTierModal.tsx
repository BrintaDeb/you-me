import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  Printer,
  Sparkles,
  CheckCircle2,
  Lock,
  FileArchive
} from 'lucide-react';
import type { WeddingStory } from '../data/couplesData';
import type { ClientRole } from '../utils/galleryStorage';
import { triggerHaptic } from '../utils/haptics';
import './DownloadTierModal.css';

interface DownloadTierModalProps {
  story: WeddingStory;
  isOpen: boolean;
  onClose: () => void;
  userRole?: ClientRole;
  selectedCount?: number;
}

type DownloadTier = 'web' | 'master';

export const DownloadTierModal: React.FC<DownloadTierModalProps> = ({
  story,
  isOpen,
  onClose,
  userRole = 'couple',
  selectedCount = 0
}) => {
  const [selectedTier, setSelectedTier] = useState<DownloadTier>('web');
  const [isPackaging, setIsPackaging] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const timerIdsRef = useRef<number[]>([]);

  const clearAllTimers = () => {
    timerIdsRef.current.forEach(id => window.clearTimeout(id));
    timerIdsRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  if (!isOpen) return null;

  const isMasterLocked = userRole === 'guest';

  const handleStartDownload = () => {
    if (selectedTier === 'master' && isMasterLocked) {
      triggerHaptic('warning');
      return;
    }

    clearAllTimers();
    setIsPackaging(true);
    setProgressPercent(10);
    setStatusMessage('Connecting to YOU & ME high-speed archival edge...');
    triggerHaptic('medium');

    const steps = [
      { p: 25, msg: selectedTier === 'web' ? 'Encoding 2048px sRGB color profiles...' : 'Extracting 45MP uncompressed master stills...' },
      { p: 55, msg: 'Assembling EXIF copyright & metadata manifests...' },
      { p: 80, msg: `Compiling ${story.images.length} archival frames into ZIP package...` },
      { p: 100, msg: 'Package ready! Dispatching download stream...' }
    ];

    steps.forEach((step, idx) => {
      const timerId = window.setTimeout(() => {
        setProgressPercent(step.p);
        setStatusMessage(step.msg);

        if (step.p === 100) {
          triggerHaptic('success');
          setIsPackaging(false);
          setIsFinished(true);

          // Trigger physical download of primary cover image as proof
          const a = document.createElement('a');
          const sampleImg = story.images[0]?.url || story.coverImage;
          a.href = sampleImg;
          a.download = `YOU_AND_ME_${story.slug}_${selectedTier === 'web' ? 'Social_Pack_2048px' : 'Master_Archive_45MP'}.jpg`;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.click();
        }
      }, (idx + 1) * 750);
      timerIdsRef.current.push(timerId);
    });
  };

  const handleReset = () => {
    clearAllTimers();
    setIsPackaging(false);
    setProgressPercent(0);
    setStatusMessage('');
    setIsFinished(false);
    onClose();
  };

  return (
    <div className="download-tier-overlay" role="dialog" aria-modal="true" aria-label="Resolution-Tiered Download">
      <div className="download-tier-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="download-tier-header">
          <div className="header-badge">
            <FileArchive size={14} className="gold-icon" />
            <span>Archival Download Vault</span>
          </div>
          <button
            type="button"
            className="download-tier-close"
            onClick={handleReset}
            aria-label="Close download modal"
          >
            <X size={20} />
          </button>
        </div>

        <h2 className="download-tier-title">Download {story.title}&apos;s Collection</h2>
        <p className="download-tier-subtitle">
          Select your intended format based on whether you are sharing to mobile devices or printing fine-art museum canvases.
        </p>

        {/* Tier Options Cards */}
        <div className="tier-cards-grid">
          {/* Card 1: Social & Mobile Web Pack */}
          <div
            className={`tier-card ${selectedTier === 'web' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedTier('web');
              triggerHaptic('light');
            }}
          >
            <div className="tier-card-radio">
              <span className={`radio-dot ${selectedTier === 'web' ? 'active' : ''}`} />
            </div>

            <div className="tier-card-body">
              <div className="tier-icon-wrap">
                <Smartphone size={22} className="tier-icon" />
              </div>

              <div className="tier-header-row">
                <h3 className="tier-name">Social &amp; Mobile Web Pack</h3>
                <span className="tier-pill-fast">Instant Ready</span>
              </div>

              <div className="tier-spec-list">
                <span className="tier-spec"><strong>Resolution:</strong> 2048px (Long edge)</span>
                <span className="tier-spec"><strong>Color Profile:</strong> sRGB Retina Optimized</span>
                <span className="tier-spec"><strong>Estimated Size:</strong> ~45 MB (Compressed ZIP)</span>
                <span className="tier-spec"><strong>Best For:</strong> Instagram, WhatsApp, iPhone &amp; iPad wallpapers</span>
              </div>
            </div>
          </div>

          {/* Card 2: 45MP Master Print Archive */}
          <div
            className={`tier-card ${selectedTier === 'master' ? 'selected' : ''} ${isMasterLocked ? 'is-locked' : ''}`}
            onClick={() => {
              if (!isMasterLocked) {
                setSelectedTier('master');
                triggerHaptic('light');
              } else {
                triggerHaptic('warning');
              }
            }}
          >
            <div className="tier-card-radio">
              {isMasterLocked ? (
                <Lock size={15} className="lock-icon" />
              ) : (
                <span className={`radio-dot ${selectedTier === 'master' ? 'active' : ''}`} />
              )}
            </div>

            <div className="tier-card-body">
              <div className="tier-icon-wrap master">
                <Printer size={22} className="tier-icon gold-icon" />
              </div>

              <div className="tier-header-row">
                <h3 className="tier-name">45MP Master Print Archive</h3>
                {isMasterLocked ? (
                  <span className="tier-pill-locked">Couple / Family Only</span>
                ) : (
                  <span className="tier-pill-master">Museum Quality</span>
                )}
              </div>

              <div className="tier-spec-list">
                <span className="tier-spec"><strong>Resolution:</strong> Ultra HD 8K Raw Stills (45+ Megapixels)</span>
                <span className="tier-spec"><strong>Color Profile:</strong> ProPhoto RGB / 300 DPI</span>
                <span className="tier-spec"><strong>Estimated Size:</strong> ~2.8 GB (Multi-Volume Archive)</span>
                <span className="tier-spec"><strong>Best For:</strong> Framed gallery canvases, wall enlargements, life-long backup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected count info */}
        {selectedCount > 0 && (
          <div className="tier-curation-notice">
            <Sparkles size={14} className="gold-icon" />
            <span>Includes all {story.images.length} frames, with {selectedCount} marked for your printed lay-flat album.</span>
          </div>
        )}

        {/* Progress Packaging Area */}
        {isPackaging && (
          <div className="download-progress-container">
            <div className="progress-info-row">
              <span className="progress-status">{statusMessage}</span>
              <span className="progress-percentage">{progressPercent}%</span>
            </div>
            <div className="download-progress-bar">
              <div className="download-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Finished confirmation */}
        {isFinished && (
          <div className="download-finished-banner">
            <CheckCircle2 size={20} className="gold-icon" />
            <span>Your download stream has commenced! If the prompt does not appear, check your browser downloads.</span>
          </div>
        )}

        {/* Actions Footer */}
        <div className="download-tier-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleReset}
            disabled={isPackaging}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary tier-download-cta"
            onClick={handleStartDownload}
            disabled={isPackaging || isFinished || (selectedTier === 'master' && isMasterLocked)}
          >
            {isPackaging ? (
              <span>Packaging Files...</span>
            ) : isFinished ? (
              <><span>Downloaded</span> <CheckCircle2 size={16} /></>
            ) : (
              <>
                <span>Download {selectedTier === 'web' ? 'Social Pack' : 'Master Archive'}</span>
                <Download size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
