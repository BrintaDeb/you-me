import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import type { DynamicAboutPhoto } from '../data/businessData';
import './AboutLightbox.css';

interface AboutLightboxProps {
  photos: DynamicAboutPhoto[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onBookCta?: () => void;
}

export const AboutLightbox: React.FC<AboutLightboxProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  onBookCta
}) => {
  const currentPhoto = photos[currentIndex];

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div
      className="about-lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${currentPhoto.title} — Photographic Details`}
      onClick={onClose}
    >
      <div className="about-lightbox-backdrop" />

      {/* Top Header Bar */}
      <header className="about-lightbox-header" onClick={(e) => e.stopPropagation()}>
        <div className="about-lightbox-header-info">
          <span className="about-lightbox-tag">
            <Sparkles size={12} /> {currentPhoto.tag}
          </span>
          <span className="about-lightbox-counter">
            {String(currentIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
          </span>
        </div>

        <button
          type="button"
          className="about-lightbox-close"
          onClick={onClose}
          aria-label="Close photo details"
        >
          <X size={20} />
        </button>
      </header>

      {/* Main Viewport */}
      <div className="about-lightbox-stage" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="about-lightbox-nav prev"
          onClick={handlePrev}
          aria-label="Previous photograph"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="about-lightbox-image-container">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title}
            className="about-lightbox-img"
          />
        </div>

        <button
          type="button"
          className="about-lightbox-nav next"
          onClick={handleNext}
          aria-label="Next photograph"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Bottom Panel: Story, Craft Details & Thumbnails */}
      <footer className="about-lightbox-footer" onClick={(e) => e.stopPropagation()}>
        <div className="about-lightbox-meta-row">
          <div className="about-lightbox-text-col">
            <h3 className="about-lightbox-title">{currentPhoto.title}</h3>
            <div className="about-lightbox-sub-row">
              <span className="about-lightbox-subtitle">
                <MapPin size={13} /> {currentPhoto.subtitle}
              </span>
              <span className="about-lightbox-craft">
                <Camera size={13} /> {currentPhoto.craft}
              </span>
            </div>
            <p className="about-lightbox-story">{currentPhoto.storyNote}</p>
          </div>

          <div className="about-lightbox-action-col">
            <div className="about-lightbox-gear-chip">
              <strong>Craft Gear:</strong> {currentPhoto.gear}
            </div>
            {onBookCta && (
              <button
                type="button"
                className="btn btn-primary about-lightbox-cta"
                onClick={() => {
                  onClose();
                  onBookCta();
                }}
              >
                Inquire For This Aesthetic <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Thumbnail Filmstrip */}
        <div className="about-lightbox-thumbnails" role="tablist" aria-label="Photo thumbnails">
          {photos.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              className={`about-lightbox-thumb ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => onNavigate(idx)}
              aria-label={`View photo ${idx + 1}: ${photo.title}`}
            >
              <img src={photo.url} alt={photo.title} loading="lazy" />
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};
