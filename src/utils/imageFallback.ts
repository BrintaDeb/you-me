/**
 * imageFallback.ts — Global Image Fallback & Visibility Protection
 *
 * Ensures that if any remote CDN (e.g. Wix, external image host) fails, drops connection,
 * or returns a 404/403, images fail over gracefully to a bundled local high-resolution asset.
 */

import React from 'react';

export const DEFAULT_FALLBACK_IMAGE = '/assets/posters/paraj_mrinmoyee.jpg';
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
