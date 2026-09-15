import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Image as ImageIcon, ArrowRight, LayoutGrid, Film } from 'lucide-react';
import { couplesData } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { FilmstripReelView } from '../components/FilmstripReelView';
import { galleryStorage } from '../utils/galleryStorage';
import './PortfolioPage.css';

interface PortfolioPageProps {
  onSelectStory: (story: WeddingStory) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onSelectStory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'filmstrip'>('grid');
  const [allStories, setAllStories] = useState<WeddingStory[]>(couplesData);

  useEffect(() => {
    let isMounted = true;
    galleryStorage.getUnifiedStories().then(stories => {
      if (isMounted && stories && stories.length > 0) {
        setAllStories(stories);
      }
    }).catch(err => {
      console.warn('Could not fetch custom stories for portfolio:', err);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStories = allStories.filter(story => {
    return story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           story.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <main className="portfolio-page" id="main-content">
      <section className="portfolio-hero-banner">
        <video
          src="/assets/videos/portfolio_bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="portfolio-bg-video"
          aria-hidden="true"
        />
        <div className="portfolio-hero-overlay" />
        <div className="portfolio-hero-content">
          <div className="eyebrow">
            <Sparkles size={14} /> The Archive
          </div>
          <h1 className="portfolio-title">
            Our Complete Portfolio
          </h1>
          <p className="portfolio-subtitle">
            Explore authentic wedding celebrations and handcrafted moments of unrepeatable joy, rituals, and emotion.
          </p>
        </div>
      </section>

      <section className="portfolio-main-grid-section">
        <div className="container-wide">
          <div className="portfolio-controls-bar">
            <div className="portfolio-filters" role="tablist" aria-label="Portfolio gallery filter">
              <button
                type="button"
                role="tab"
                aria-selected={true}
                className="filter-pill active"
              >
                All Works
              </button>
            </div>

            <div className="portfolio-actions-right">
              {/* View Switcher Toggle */}
              <div className="portfolio-view-switcher" role="group" aria-label="Archive view mode">
                <button
                  type="button"
                  className={`view-switcher-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  title="Grid View"
                >
                  <LayoutGrid size={15} />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  className={`view-switcher-btn ${viewMode === 'filmstrip' ? 'active' : ''}`}
                  onClick={() => setViewMode('filmstrip')}
                  aria-pressed={viewMode === 'filmstrip'}
                  title="35mm Filmstrip Reel"
                >
                  <Film size={15} />
                  <span>35mm Reel</span>
                </button>
              </div>

              <div className="portfolio-search-box">
                <Search size={16} className="portfolio-search-icon" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search couples or styles..."
                  className="portfolio-search-input"
                  aria-label="Search wedding stories"
                />
              </div>
            </div>
          </div>

          <div className="portfolio-count-badge" style={{ marginBottom: 24 }}>
            {searchQuery
              ? `Celebrations matching "${searchQuery}"`
              : 'All Wedding Stories & Celebrations'}
          </div>

          {viewMode === 'filmstrip' ? (
            <FilmstripReelView
              stories={filteredStories}
              onSelectStory={onSelectStory}
            />
          ) : (
            <div className="portfolio-grid">
            {filteredStories.map(story => (
              <article
                key={story.id}
                className="portfolio-card"
                onClick={() => onSelectStory(story)}
                role="button"
                tabIndex={0}
                aria-label={`Open gallery for ${story.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectStory(story);
                  }
                }}
              >
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="portfolio-card-img"
                  loading="lazy"
                />
                <div className="portfolio-card-gradient">
                  <span className="portfolio-card-cat">{story.category}</span>
                  <h2 className="portfolio-card-name">{story.title}</h2>
                  <div className="portfolio-card-footer">
                    <span>
                      <ImageIcon size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                      {story.imageCount} Photographs
                    </span>
                    <span className="portfolio-card-link">
                      View Story <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
            </div>
          )}

          {filteredStories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: 12 }}>No wedding stories found matching &ldquo;{searchQuery}&rdquo;</p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSearchQuery('');
                }}
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
