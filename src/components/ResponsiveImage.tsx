import React, { useState } from 'react';
import { DEFAULT_FALLBACK_IMAGE } from '../utils/imageFallback';
import './ResponsiveImage.css';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  priority?: boolean;
}

/**
 * Production-Grade Responsive Image
 * Features skeleton shimmer placeholder, smooth opacity fade-in on load,
 * async decoding, and direct authentic asset streaming without broken synthetic endpoints.
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio,
  priority = false,
  style,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`responsive-img-wrapper ${isLoaded ? 'is-loaded' : ''} ${hasError ? 'has-error' : ''}`}
      style={{
        aspectRatio: aspectRatio,
        ...style
      }}
    >
      {!isLoaded && !hasError && (
        <div className="responsive-img-skeleton" aria-hidden="true" />
      )}

      <img
        src={src}
        alt={alt}
        className={`responsive-img-core ${className} ${isLoaded ? 'loaded' : ''}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => {
          setIsLoaded(true);
          setHasError(false);
        }}
        onError={(e) => {
          if (!e.currentTarget.dataset.hasFallback) {
            e.currentTarget.dataset.hasFallback = 'true';
            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
          } else {
            setHasError(true);
            setIsLoaded(true);
          }
        }}
        {...rest}
      />
    </div>
  );
};
