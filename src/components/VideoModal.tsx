import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_VIDEO_POSTER } from '../utils/imageFallback';
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
  posterUrl = DEFAULT_VIDEO_POSTER,
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

      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.play().catch(() => {});
      }

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        if (videoEl) {
          videoEl.pause();
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
        {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
          <iframe
            src={
              videoUrl.includes('watch?v=')
                ? `https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0]}?autoplay=1&rel=0`
                : `https://www.youtube.com/embed/${videoUrl.split('youtu.be/')[1]?.split('?')[0]}?autoplay=1&rel=0`
            }
            title={title}
            className="video-modal-player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none', width: '100%', aspectRatio: '16/9' }}
          />
        ) : videoUrl.includes('vimeo.com') ? (
          <iframe
            src={`https://player.vimeo.com/video/${videoUrl.split('vimeo.com/')[1]?.split('?')[0]}?autoplay=1`}
            title={title}
            className="video-modal-player"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ border: 'none', width: '100%', aspectRatio: '16/9' }}
          />
        ) : (
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
        )}
      </div>
    </div>
  );
};

