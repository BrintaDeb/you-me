import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { WeddingImage } from '../data/couplesData';
import './Lightbox.css';

interface LightboxProps {
  images: WeddingImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate
}) => {
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
        <button
          type="button"
          className="lightbox-close-btn"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <X size={20} />
        </button>
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
