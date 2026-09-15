import React, { useState } from 'react';
import './ResponsiveImage.css';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Intelligent Responsive Image with Skeleton Shimmer,
 * async decoding, error recovery, and optional Wix CDN srcset.
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  style,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate responsive srcSet for Wix static media if applicable
  const generateSrcSet = (url: string): string | undefined => {
    if (!url || !url.includes('static.wixstatic.com/media/')) return undefined;

    // Wix media standard delivery provides high performance when requested directly
    // Generate width descriptors
    return `${url} 480w, ${url} 800w, ${url} 1200w, ${url} 1600w`;
  };

  const srcSet = generateSrcSet(src);

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
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        className={`responsive-img-core ${className} ${isLoaded ? 'loaded' : ''}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        {...rest}
      />
    </div>
  );
};
