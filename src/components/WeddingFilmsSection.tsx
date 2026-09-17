import React from 'react';
import { Play, Film, Sparkles } from 'lucide-react';
import { featuredStories } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { usePublicSections } from '../hooks/usePublicSections';
import { handleImageError } from '../utils/imageFallback';
import './WeddingFilmsSection.css';

interface WeddingFilmsSectionProps {
  onPlayFilm: (story: WeddingStory) => void;
}

export const WeddingFilmsSection: React.FC<WeddingFilmsSectionProps> = ({ onPlayFilm }) => {
  // Dynamic film posters from API — if configured, override poster images
  const { sections } = usePublicSections();
  const dynamicFilmPosters = sections?.['films'] ?? [];

  // Build effective film list: map dynamic video or poster based on media type
  const effectiveStories = featuredStories.map((story, idx) => {
    const dynamicItem = dynamicFilmPosters[idx];
    if (!dynamicItem) return story;
    const url = import.meta.env.DEV && dynamicItem.url.startsWith('/uploads/')
      ? `http://localhost:8000${dynamicItem.url}`
      : dynamicItem.url;

    if (dynamicItem.type === 'video' || url.endsWith('.mp4') || url.endsWith('.webm')) {
      return { ...story, videoUrl: url };
    }
    return { ...story, videoPoster: url, coverImage: url };
  });
  return (
    <section className="films-section" id="films" aria-labelledby="films-heading">
      <div className="container-wide">
        <div className="films-header">
          <div className="eyebrow">
            <Sparkles size={14} /> Motion &amp; Emotion
          </div>
          <h2 id="films-heading" className="films-title">
            Love in Motion
          </h2>
          <p className="films-subtitle">
            Cinematic wedding highlights captured in motion. Experience the laughter, tears, and vows rendered with unhurried documentary elegance.
          </p>
        </div>

        <div className="films-grid">
          {effectiveStories.map(story => (
            <div
              key={story.id}
              className="film-card wedding-film-card"
              data-cursor="play"
              data-cursor-label="PLAY FILM"
              onClick={() => onPlayFilm(story)}
              role="button"
              tabIndex={0}
              aria-label={`Play ${story.title} wedding film`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onPlayFilm(story);
                }
              }}
            >
              <img
                src={story.videoPoster || story.coverImage}
                alt={`${story.title} film poster`}
                className="film-poster-img"
                loading="lazy"
                onError={handleImageError}
              />
              <div className="film-play-badge" aria-hidden="true">
                <Play size={24} fill="currentColor" style={{ marginLeft: 3 }} />
              </div>
              <div className="film-card-overlay">
                <div>
                  <h3 className="film-title">{story.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Cinematic Wedding Highlight
                  </span>
                </div>
                <span className="film-badge">
                  <Film size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  1080p FHD
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
