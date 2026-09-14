import React, { useState } from 'react';
import { ArrowRight, Sparkles, Image as ImageIcon } from 'lucide-react';
import { couplesData } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import './PortfolioShowcase.css';

interface PortfolioShowcaseProps {
  onSelectStory: (story: WeddingStory) => void;
  onViewAllPortfolio: () => void;
}

const categories = ['All', 'Candid & Documentary', 'Traditional Wedding', 'Destination Wedding', 'Bengali Wedding'];

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  onSelectStory,
  onViewAllPortfolio
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

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
          <h2 id="portfolio-heading" className="portfolio-title">
            Stories We’ve Had the Honour to Tell
          </h2>
          <p className="portfolio-subtitle">
            Every celebration holds its own rhythm, tenderness, and grandeur. Explore a curated selection of authentic celebrations and timeless love stories.
          </p>
        </div>

        <div className="portfolio-filters" role="tablist" aria-label="Filter portfolio by category">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="portfolio-grid">
          {displayedCouples.map(story => (
            <article
              key={story.id}
              className="portfolio-card"
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
              <img
                src={story.coverImage}
                alt={story.title}
                className="portfolio-card-img"
                loading="lazy"
              />
              <div className="portfolio-card-gradient">
                <span className="portfolio-card-cat">{story.category}</span>
                <h3 className="portfolio-card-name">{story.title}</h3>
                <div className="portfolio-card-footer">
                  <span>
                    <ImageIcon size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    {story.imageCount} Frames
                  </span>
                  <span className="portfolio-card-link">
                    View Gallery <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="portfolio-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onViewAllPortfolio}
          >
            Explore Complete Portfolio Archive &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};
