import React, { useMemo } from 'react';
import { couplesData } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { handleImageError } from '../utils/imageFallback';
import './PhotoShowreel.css';

interface ShowreelCard {
  id: string;
  story: WeddingStory;
  imageIndex: number;
  imageUrl: string;
  coupleTitle: string;
  category: string;
  location: string;
}

interface PhotoShowreelProps {
  onPhotoClick?: (story: WeddingStory, imageIndex: number) => void;
  tiltAngle?: number;
  className?: string;
  showCaption?: boolean;
}

export const PhotoShowreel: React.FC<PhotoShowreelProps> = ({
  onPhotoClick,
  tiltAngle = -2,
  className = '',
  showCaption = false
}) => {
  // Build two distinct, rich sets of wedding portrait photos from couplesData
  const { row1Cards, row2Cards } = useMemo(() => {
    const r1: ShowreelCard[] = [];
    const r2: ShowreelCard[] = [];

    couplesData.forEach((story, storyIdx) => {
      story.images.forEach((img, imgIdx) => {
        const card: ShowreelCard = {
          id: `${story.id}-${img.id || imgIdx}`,
          story,
          imageIndex: imgIdx,
          imageUrl: img.url,
          coupleTitle: story.title,
          category: story.category,
          location: story.location || 'Agartala • Kolkata'
        };

        // Alternate cards between row 1 and row 2 for diverse visual pacing
        if ((storyIdx + imgIdx) % 2 === 0) {
          if (r1.length < 16) r1.push(card);
        } else {
          if (r2.length < 16) r2.push(card);
        }
      });
    });

    // Fallbacks if fewer images
    return {
      row1Cards: r1.length > 0 ? r1 : r1.concat(r1),
      row2Cards: r2.length > 0 ? r2 : r2.concat(r2)
    };
  }, []);

  const handleCardClick = (card: ShowreelCard) => {
    if (onPhotoClick) {
      onPhotoClick(card.story, card.imageIndex);
    }
  };

  return (
    <div
      className={`photo-showreel-container ${className}`}
      style={{ '--showreel-tilt': `${tiltAngle}deg` } as React.CSSProperties}
      aria-label="Continuous cinematic wedding photography showreel"
    >
      {/* ── Ribbon Row 1: Scrolling Left ────────────────────── */}
      <div className="showreel-row-wrapper" role="region" aria-label="Showreel track 1">
        <div className="showreel-track scroll-left">
          {/* First loop sequence */}
          {row1Cards.map((card, idx) => (
            <div
              key={`r1-a-${card.id}-${idx}`}
              className="showreel-card"
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card);
                }
              }}
              aria-label={`View photo of ${card.coupleTitle}`}
            >
              <div className="showreel-media">
                <img
                  src={card.imageUrl}
                  alt={card.coupleTitle}
                  className="showreel-img"
                  loading="lazy"
                  onError={handleImageError}
                />
                <div className="showreel-card-overlay" aria-hidden="true" />
              </div>
              {showCaption && (
                <div className="showreel-card-caption">
                  <span className="showreel-card-name">{card.coupleTitle}</span>
                  <span className="showreel-card-tag">{card.category}</span>
                </div>
              )}
            </div>
          ))}

          {/* Seamless duplicate sequence for infinite seamless marquee */}
          {row1Cards.map((card, idx) => (
            <div
              key={`r1-b-${card.id}-${idx}`}
              className="showreel-card"
              role="button"
              tabIndex={0}
              aria-hidden="true"
              onClick={() => handleCardClick(card)}
            >
              <div className="showreel-media">
                <img
                  src={card.imageUrl}
                  alt=""
                  className="showreel-img"
                  loading="lazy"
                  onError={handleImageError}
                />
                <div className="showreel-card-overlay" />
              </div>
              {showCaption && (
                <div className="showreel-card-caption">
                  <span className="showreel-card-name">{card.coupleTitle}</span>
                  <span className="showreel-card-tag">{card.category}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Ribbon Row 2: Scrolling Right (Reverse Parallax) ── */}
      <div className="showreel-row-wrapper" role="region" aria-label="Showreel track 2">
        <div className="showreel-track scroll-right">
          {/* First loop sequence */}
          {row2Cards.map((card, idx) => (
            <div
              key={`r2-a-${card.id}-${idx}`}
              className="showreel-card"
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card);
                }
              }}
              aria-label={`View photo of ${card.coupleTitle}`}
            >
              <div className="showreel-media">
                <img
                  src={card.imageUrl}
                  alt={card.coupleTitle}
                  className="showreel-img"
                  loading="lazy"
                  onError={handleImageError}
                />
                <div className="showreel-card-overlay" aria-hidden="true" />
              </div>
              {showCaption && (
                <div className="showreel-card-caption">
                  <span className="showreel-card-name">{card.coupleTitle}</span>
                  <span className="showreel-card-tag">{card.category}</span>
                </div>
              )}
            </div>
          ))}

          {/* Seamless duplicate sequence for infinite seamless marquee */}
          {row2Cards.map((card, idx) => (
            <div
              key={`r2-b-${card.id}-${idx}`}
              className="showreel-card"
              role="button"
              tabIndex={0}
              aria-hidden="true"
              onClick={() => handleCardClick(card)}
            >
              <div className="showreel-media">
                <img
                  src={card.imageUrl}
                  alt=""
                  className="showreel-img"
                  loading="lazy"
                  onError={handleImageError}
                />
                <div className="showreel-card-overlay" />
              </div>
              {showCaption && (
                <div className="showreel-card-caption">
                  <span className="showreel-card-name">{card.coupleTitle}</span>
                  <span className="showreel-card-tag">{card.category}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
