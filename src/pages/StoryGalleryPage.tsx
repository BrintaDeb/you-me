import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ZoomIn, Play, Calendar } from 'lucide-react';
import { couplesData } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { Lightbox } from '../components/Lightbox';
import './StoryGalleryPage.css';

interface StoryGalleryPageProps {
  story: WeddingStory;
  onBackToPortfolio: () => void;
  onSelectStory: (story: WeddingStory) => void;
  onPlayFilm?: (story: WeddingStory) => void;
  onCheckDate?: () => void;
}

export const StoryGalleryPage: React.FC<StoryGalleryPageProps> = ({
  story,
  onBackToPortfolio,
  onSelectStory,
  onPlayFilm,
  onCheckDate
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Find index of current story in couplesData
  const currentIndex = couplesData.findIndex(c => c.id === story.id);
  const prevStory = couplesData[(currentIndex - 1 + couplesData.length) % couplesData.length];
  const nextStory = couplesData[(currentIndex + 1) % couplesData.length];

  const handleOpenLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <main className="story-gallery-page" id="main-content">
      <header className="gallery-hero">
        <div className="container">
          <nav className="gallery-breadcrumb" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={onBackToPortfolio}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={14} /> Back to Portfolio
            </button>
            <span>/</span>
            <span style={{ color: 'var(--accent-gold)' }}>{story.title}</span>
          </nav>

          <h1 className="gallery-hero-title">{story.title}</h1>
          <p className="gallery-hero-tagline">&ldquo;{story.tagline}&rdquo;</p>

          <div className="gallery-hero-meta">
            <span>{story.category}</span>
            <span>•</span>
            <span>{story.imageCount} Curated Photographs</span>
            {story.videoUrl && onPlayFilm && (
              <>
                <span>•</span>
                <button
                  type="button"
                  className="play-film-btn"
                  onClick={() => onPlayFilm(story)}
                >
                  <Play size={14} fill="currentColor" /> Watch Film
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="gallery-masonry-section">
        <div className="container-wide">
          <div className="gallery-masonry-grid" role="region" aria-label="Wedding Photographs Masonry">
            {story.images.map((img, idx) => (
              <figure
                key={img.id}
                className="gallery-item"
                onClick={() => handleOpenLightbox(idx)}
                role="button"
                tabIndex={0}
                aria-label={`Enlarge photograph ${idx + 1} of ${story.images.length}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleOpenLightbox(idx);
                  }
                }}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="gallery-item-img"
                  loading={idx < 6 ? 'eager' : 'lazy'}
                />
                <figcaption className="gallery-item-overlay" aria-hidden="true">
                  <ZoomIn size={28} />
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="gallery-footer-nav">
            <button
              type="button"
              className="gallery-nav-btn"
              onClick={() => {
                onSelectStory(prevStory);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <ArrowLeft size={16} /> Previous: {prevStory.title}
            </button>

            {onCheckDate && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onCheckDate}
              >
                <Calendar size={16} /> Check Your Date for Similar Story
              </button>
            )}

            <button
              type="button"
              className="gallery-nav-btn"
              onClick={() => {
                onSelectStory(nextStory);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Next: {nextStory.title} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <Lightbox
        images={story.images}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentImageIndex}
      />
    </main>
  );
};
