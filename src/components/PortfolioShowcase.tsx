import React, { useState } from 'react';
import { ArrowRight, Sparkles, Image as ImageIcon, MapPin, Film, Compass, Camera } from 'lucide-react';
import { couplesData } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { usePublicSections } from '../hooks/usePublicSections';
import { handleImageError } from '../utils/imageFallback';
import { LetterFlipHeading } from './LetterFlipHeading';
import { PhotoShowreel } from './PhotoShowreel';
import './PortfolioShowcase.css';

interface PortfolioShowcaseProps {
  onSelectStory: (story: WeddingStory) => void;
  onViewAllPortfolio: () => void;
}

const categories = ['All', 'Candid & Documentary', 'Traditional Wedding', 'Destination Wedding', 'Bengali Wedding'];

const CAMERA_NOTES = [
  'Leica M11 • 50mm Summilux • f/1.4',
  'Hasselblad X2D 100C • 38mm f/2.5',
  'Sony Cinema FX3 • Anamorphic Cine',
  'Leica Q3 • 28mm Summilux • Natural Twilight',
  'Sony A7R V • 85mm f/1.4 GM • Golden Hour',
  'Hasselblad X2D • 55mm • Calibrated Emulation'
];

const CURATORIAL_TAGS = [
  'Editorial Monograph',
  'Ceremonial Splendor',
  'Spontaneous Intimacy',
  'Fine-Art Heirloom',
  'Anamorphic Motion',
  'Heritage Ritual'
];

const COORDINATES_MAP: Record<string, string> = {
  'Kolkata': "22°34'N 88°21'E • Calcutta Classical",
  'Rajasthan': "26°55'N 75°49'E • Royal Heritage",
  'Goa': "15°29'N 73°49'E • Coastal Horizon",
  'Traditional Bengali Wedding': "22°32'N 88°24'E • Traditional Atelier",
  'Grand Heritage Palace': "24°35'N 73°41'E • Heritage Palace",
  'Calcutta Classical': "22°34'N 88°21'E • Calcutta Classical"
};

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  onSelectStory,
  onViewAllPortfolio
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Dynamic storyboard strip from API (renders above grid if configured)
  const { sections } = usePublicSections();
  const storyboardItems = sections?.['storyboard'] ?? [];

  const filteredCouples = couplesData.filter(c => {
    if (selectedCategory === 'All') return true;
    return c.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  // Display top 6 for homepage showcase
  const displayedCouples = filteredCouples.slice(0, 6);

  return (
    <section className="portfolio-showcase" id="portfolio" aria-labelledby="portfolio-heading">
      <div className="container-wide">
        <div className="portfolio-header">
          <div className="eyebrow">
            <Sparkles size={14} /> Curated Stories
          </div>
          <LetterFlipHeading
            prefix="Our Curated"
            text="WEDDING STORIES"
            as="h2"
            align="center"
            delay={150}
            className="portfolio-heading-flip"
          />
          <p className="portfolio-subtitle">
            Every celebration holds its own rhythm, tenderness, and grandeur. Explore a curated selection of authentic celebrations and timeless love stories.
          </p>
        </div>

        {/* Dynamic Editor's Selection Strip — only shown when the API has storyboard items */}
        {storyboardItems.length > 0 && (
          <div className="portfolio-dynamic-strip" aria-label="Editor's selection">
            <div className="portfolio-dynamic-strip-label">
              <Sparkles size={12} /> Editor's Selection
            </div>
            <div className="portfolio-dynamic-strip-scroll">
              {storyboardItems.map(item => {
                const url = import.meta.env.DEV && item.url.startsWith('/uploads/')
                  ? `http://localhost:8000${item.url}`
                  : item.url;
                return (
                  <div key={item.id} className="portfolio-dynamic-thumb">
                    <img
                      src={url}
                      alt={item.alt_text || item.title || 'Selected frame'}
                      className="portfolio-dynamic-thumb-img"
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="portfolio-filters" role="tablist" aria-label="Filter portfolio by category">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              role="tab"
              data-magnetic
              aria-selected={selectedCategory === cat}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cinematic Dual-Ribbon Photo Showreel */}
        <PhotoShowreel
          onPhotoClick={onSelectStory}
          tiltAngle={-1.5}
        />

        {/* Interactive Editorial Magazine Grid */}
        <div className="editorial-magazine-grid" key={selectedCategory}>
          {displayedCouples.map((story, idx) => {
            const cameraNote = CAMERA_NOTES[idx % CAMERA_NOTES.length];
            const curatorialTag = CURATORIAL_TAGS[idx % CURATORIAL_TAGS.length];
            const locCoordinates = COORDINATES_MAP[story.location || ''] || story.location || "22°34'N 88°21'E • Calcutta Classical";

            return (
              <article
                key={story.id}
                className={`editorial-card story-card editorial-card-${idx}`}
                data-cursor="story"
                data-cursor-label="READ STORY"
                onClick={() => onSelectStory(story)}
                tabIndex={0}
                role="button"
                aria-label={`Open gallery for ${story.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectStory(story);
                  }
                }}
              >
                <div className="editorial-card-media-wrap">
                  {/* Viewfinder corner pips */}
                  <span className="corner-pip corner-tl" aria-hidden="true" />
                  <span className="corner-pip corner-tr" aria-hidden="true" />
                  <span className="corner-pip corner-bl" aria-hidden="true" />
                  <span className="corner-pip corner-br" aria-hidden="true" />

                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="portfolio-card-img"
                    loading={idx < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={handleImageError}
                  />

                  {/* Editorial Callout Marginalia (Floating Top Banner) */}
                  <div className="editorial-card-plate-bar">
                    <span className="editorial-plate-tag">
                      <Compass size={11} className="gold-icon" />
                      PLATE {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="editorial-craft-note">
                      <Camera size={11} className="gold-icon" />
                      {cameraNote}
                    </span>
                  </div>

                  <div className="portfolio-card-gradient">
                    <div className="portfolio-card-top-meta">
                      <span className="portfolio-card-cat">{story.category}</span>
                      <span className="portfolio-curatorial-tag">{curatorialTag}</span>
                      {story.videoUrl && (
                        <span className="portfolio-card-badge" title="Includes Cinematic Film">
                          <Film size={11} /> 4K Film
                        </span>
                      )}
                    </div>

                    <h3 className="portfolio-card-name">{story.title}</h3>

                    {story.tagline && (
                      <p className="portfolio-card-tagline">{story.tagline}</p>
                    )}

                    <div className="portfolio-card-footer">
                      <div className="portfolio-card-meta-left">
                        <span>
                          <ImageIcon size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                          {story.imageCount} Master Frames
                        </span>
                        <span className="portfolio-card-loc" title={locCoordinates}>
                          <MapPin size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                          {locCoordinates}
                        </span>
                      </div>
                      <span className="portfolio-card-link">
                        Inspect Story <ArrowRight size={13} className="portfolio-card-arrow" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="portfolio-actions">
          <button
            type="button"
            className="btn btn-outline"
            data-magnetic
            onClick={onViewAllPortfolio}
          >
            Explore Complete Portfolio Archive &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};
