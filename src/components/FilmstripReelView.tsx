import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Film, ArrowRight, Image as ImageIcon } from 'lucide-react';
import type { WeddingStory } from '../data/couplesData';
import './FilmstripReelView.css';

interface FilmstripReelViewProps {
  stories: WeddingStory[];
  onSelectStory: (story: WeddingStory) => void;
}

export const FilmstripReelView: React.FC<FilmstripReelViewProps> = ({
  stories,
  onSelectStory
}) => {
  const reelTrackRef = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useState(0);
  const [maxScroll, setMaxScroll] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);
  const [activeCenterIdx, setActiveCenterIdx] = useState(0);

  // Update scroll bounds and active center item
  const updateScrollState = useCallback(() => {
    if (!reelTrackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = reelTrackRef.current;
    setScrollX(scrollLeft);
    setMaxScroll(Math.max(1, scrollWidth - clientWidth));

    // Calculate item closest to viewport center
    const viewportCenter = scrollLeft + clientWidth / 2;
    const items = reelTrackRef.current.querySelectorAll('.film-frame-container');
    let closestIdx = 0;
    let minDistance = 99999;

    items.forEach((item, idx) => {
      const el = item as HTMLElement;
      const itemCenter = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(viewportCenter - itemCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    setActiveCenterIdx(closestIdx);
  }, []);

  useEffect(() => {
    const el = reelTrackRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    // Mousewheel horizontal scroll support
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.5;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [updateScrollState, stories]);

  // Click and drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!reelTrackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - reelTrackRef.current.offsetLeft);
    setStartScrollLeft(reelTrackRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !reelTrackRef.current) return;
    e.preventDefault();
    const x = e.pageX - reelTrackRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    reelTrackRef.current.scrollLeft = startScrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const scrollByAmount = (amount: number) => {
    if (!reelTrackRef.current) return;
    reelTrackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const scrollProgress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollX / maxScroll)) : 0;

  return (
    <div className="filmstrip-reel-component" role="region" aria-label="35mm Filmstrip Archive View">
      {/* Reel HUD Controls */}
      <div className="filmstrip-hud">
        <div className="filmstrip-hud-left">
          <span className="filmstrip-pill">
            <Film size={13} /> 35mm Panoramic Horizon Reel
          </span>
          <span className="filmstrip-frame-counter">
            Story // <strong>{stories[activeCenterIdx]?.title || 'Wedding Celebration'}</strong>
          </span>
        </div>

        <div className="filmstrip-hud-actions">
          <button
            type="button"
            className="filmstrip-arrow-btn"
            onClick={() => scrollByAmount(-480)}
            disabled={scrollX <= 10}
            aria-label="Scroll left in filmstrip"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="filmstrip-arrow-btn"
            onClick={() => scrollByAmount(480)}
            disabled={scrollX >= maxScroll - 10}
            aria-label="Scroll right in filmstrip"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Panoramic Cylindrical 3D Viewport */}
      <div className="filmstrip-viewport-curved">
        {/* Continuous 35mm Sprocket Holes — Top Bar */}
        <div className="filmstrip-perforation-bar top-perforations" aria-hidden="true">
          <div className="filmstrip-leader-code">KODAK VISION3 500T • SAFETY FILM • 35MM CINEMA ARCHIVE</div>
          <div className="sprocket-track">
            {Array.from({ length: 90 }).map((_, i) => (
              <span key={i} className="sprocket-hole" />
            ))}
          </div>
        </div>

        {/* The Scrollable Reel Track */}
        <div
          ref={reelTrackRef}
          className={`filmstrip-scroll-track ${isDragging ? 'is-dragging' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {stories.map((story, index) => {
            const isCenter = activeCenterIdx === index;
            const frameNumber = index + 1 < 10 ? `0${index + 1}A` : `${index + 1}A`;

            return (
              <div
                key={story.id}
                className={`film-frame-container ${isCenter ? 'is-center-frame' : ''}`}
                onClick={() => {
                  if (!isDragging) {
                    onSelectStory(story);
                  }
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  const mount = e.currentTarget.querySelector<HTMLElement>('.film-photo-mount');
                  if (mount) {
                    mount.style.setProperty('--spot-x', `${x}%`);
                    mount.style.setProperty('--spot-y', `${y}%`);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View story of ${story.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectStory(story);
                  }
                }}
              >
                {/* 35mm Frame Negative Header */}
                <div className="frame-meta-header" aria-hidden="true">
                  <span className="frame-number-stamp">{frameNumber}</span>
                  <span className="film-brand-stamp">YOU &amp; ME RAW</span>
                  <span className="frame-iso-stamp">ISO 800</span>
                </div>

                {/* Main Photograph Mount */}
                <div className="film-photo-mount">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="film-frame-image"
                    loading={index < 5 ? 'eager' : 'lazy'}
                    draggable={false}
                  />

                  <div className="film-frame-gradient-overlay">
                    <div className="film-frame-info">
                      <span className="film-frame-category">{story.category}</span>
                      <h3 className="film-frame-couple">{story.title}</h3>
                      <div className="film-frame-footer">
                        <span>
                          <ImageIcon size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                          {story.imageCount} Frames
                        </span>
                        <span className="film-frame-cta">
                          Open Story <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 35mm Frame Negative Footer */}
                <div className="frame-meta-footer" aria-hidden="true">
                  <span>EXP {index + 1}</span>
                  <span>•••</span>
                  <span>{story.slug.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continuous 35mm Sprocket Holes — Bottom Bar */}
        <div className="filmstrip-perforation-bar bottom-perforations" aria-hidden="true">
          <div className="sprocket-track">
            {Array.from({ length: 90 }).map((_, i) => (
              <span key={i} className="sprocket-hole" />
            ))}
          </div>
          <div className="filmstrip-leader-code">DOCUMENTARY WEDDING CHRONICLES • ALL RIGHTS RESERVED</div>
        </div>
      </div>

      {/* Interactive Reel Scrubber Bar */}
      <div className="filmstrip-scrubber-container">
        <span className="scrubber-label">REEL 01</span>
        <div
          className="scrubber-bar-track"
          onClick={(e) => {
            if (!reelTrackRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = (e.clientX - rect.left) / rect.width;
            reelTrackRef.current.scrollTo({
              left: clickRatio * maxScroll,
              behavior: 'smooth'
            });
          }}
        >
          <div
            className="scrubber-bar-fill"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        <span className="scrubber-label">CINEMA ARCHIVE</span>
      </div>
    </div>
  );
};
