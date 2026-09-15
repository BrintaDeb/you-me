import React, { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Check } from 'lucide-react';
import type { WeddingImage } from '../data/couplesData';
import { downloadPhotoFile } from '../utils/photoDownloader';
import { triggerHaptic } from '../utils/haptics';
import './Lightbox.css';

interface LightboxProps {
  images: WeddingImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  storySlug?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  storySlug = 'gallery'
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentImage || isDownloading) return;

    setIsDownloading(true);
    triggerHaptic('medium');

    const filename = `YOU_AND_ME_${storySlug}_Frame_${currentImage.id || String(currentIndex + 1).padStart(2, '0')}.jpg`;
    await downloadPhotoFile(currentImage.url, filename);

    setIsDownloading(false);
    setDownloadSuccess(true);
    triggerHaptic('success');
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div
      className="lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox"
      onClick={onClose}
    >
      <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
        <span className="lightbox-counter">
          {currentIndex + 1} / {images.length}
        </span>
        <div className="lightbox-header-actions">
          <button
            type="button"
            className={`lightbox-download-btn ${downloadSuccess ? 'success' : ''}`}
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label="Download photograph"
            title="Download high-resolution photograph"
          >
            {downloadSuccess ? (
              <>
                <Check size={16} className="gold-icon" />
                <span>Saved to Device</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>{isDownloading ? 'Saving...' : 'Download Photo'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="lightbox-nav-btn prev"
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        aria-label="Previous photograph"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={currentImage.url}
          alt={currentImage.alt}
          className="lightbox-img"
        />
        {currentImage.caption && (
          <p className="lightbox-caption">{currentImage.caption}</p>
        )}
      </div>

      <button
        type="button"
        className="lightbox-nav-btn next"
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        aria-label="Next photograph"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
