import React from 'react';
import './DeckleBanner.css';

interface DeckleBannerProps {
  quote?: string;
  author?: string;
  prefix?: string;
  title?: string;
  className?: string;
  variant?: 'crimson' | 'charcoal';
  showSeal?: boolean;
}

export const DeckleBanner: React.FC<DeckleBannerProps> = ({
  quote,
  author,
  prefix,
  title,
  className = '',
  variant = 'crimson',
  showSeal = true
}) => {
  return (
    <div className={`deckle-banner-wrapper ${variant} ${className}`} aria-hidden={!title}>
      {/* Top Organic Wave Edge (Smooth Silk Ribbon SVG) */}
      <div className="deckle-edge top" aria-hidden="true">
        <svg
          viewBox="0 0 1440 54"
          fill="currentColor"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,0 C120,24 240,38 360,18 C480,2 600,28 720,18 C840,8 960,30 1080,16 C1200,4 1320,22 1440,14 L1440,54 L0,54 Z" />
        </svg>
      </div>

      {/* Main Banner Surface */}
      <div className="deckle-banner-content">
        {title && (
          <div className="deckle-banner-header">
            {prefix && <span className="deckle-banner-prefix">{prefix}</span>}
            <h2 className="deckle-banner-title">{title}</h2>
          </div>
        )}

        {quote && (
          <div className="deckle-quote-container">
            <span className="deckle-quote-mark" aria-hidden="true">“</span>
            <p className="deckle-quote-text">{quote}</p>
            {author && <span className="deckle-quote-author">— {author}</span>}
          </div>
        )}
      </div>

      {/* Bottom Organic Wave Edge (Smooth Silk Ribbon SVG) */}
      <div className="deckle-edge bottom" aria-hidden="true">
        <svg
          viewBox="0 0 1440 54"
          fill="currentColor"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,0 L1440,0 C1320,34 1200,16 1080,28 C960,42 840,22 720,32 C600,40 480,16 360,26 C240,36 120,18 0,32 Z" />
        </svg>

        {/* Decorative Golden Heart Seal on bottom wave edge */}
        {showSeal && (
          <div className="deckle-heart-seal" aria-hidden="true" title="Crafted with Love by YOU & ME">
            <div className="deckle-heart-seal-inner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
