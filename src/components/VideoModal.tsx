import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './VideoModal.css';

interface VideoModalProps {
  videoUrl: string;
  posterUrl?: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  videoUrl,
  posterUrl,
  title,
  isOpen,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (closeBtnRef.current) closeBtnRef.current.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="video-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} Wedding Film`}
      onClick={onClose}
    >
      <div className="video-modal-header" onClick={(e) => e.stopPropagation()}>
        <h3 className="video-modal-title">{title} — Cinematic Film</h3>
        <button
          ref={closeBtnRef}
          type="button"
          className="video-modal-close-btn"
          onClick={onClose}
          aria-label="Close video player"
        >
          <X size={20} />
        </button>
      </div>

      <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          controls
          playsInline
          className="video-modal-player"
        >
          Your browser does not support HTML5 video.
        </video>
      </div>
    </div>
  );
};
