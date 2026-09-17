import React from 'react';
import './SkeletonSlide.css';

interface SkeletonSlideProps {
  count?: number;
}

/**
 * Shimmer skeleton shown while the hero / section media is being fetched
 * from GET /api/public/sections. Matches the proportions of the hero slides.
 */
export const SkeletonSlide: React.FC<SkeletonSlideProps> = ({ count = 1 }) => {
  return (
    <div className="skeleton-slide-container" aria-hidden="true" role="presentation">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-slide-layer">
          <div className="skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
};
