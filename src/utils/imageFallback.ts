/**
 * imageFallback.ts — Global Image Fallback & Visibility Protection
 *
 * Ensures that if any remote CDN (e.g. Wix, external image host) fails, drops connection,
 * or returns a 404/403, images fail over gracefully to a bundled local high-resolution asset.
 */

import React from 'react';

export const DEFAULT_FALLBACK_IMAGE = '/assets/portfolio/default_wedding_photo.jpg';
export const DEFAULT_VIDEO_POSTER = '/assets/posters/urmi_jasraj.jpg';
export const DEFAULT_AVATAR = '/assets/team/brinta_deb.jpg';

export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  customFallback: string = DEFAULT_FALLBACK_IMAGE
) {
  const target = event.currentTarget;
  // Guard against infinite loop if fallback itself fails
  if (!target.dataset.hasFallback) {
    target.dataset.hasFallback = 'true';
    target.src = customFallback;
  }
}

/**
 * Returns a guaranteed valid image URL, falling back to bundled default if empty or invalid
 */
export function getSafeImageUrl(
  url?: string | null,
  customFallback: string = DEFAULT_FALLBACK_IMAGE
): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return customFallback;
  }
  return url;
}

