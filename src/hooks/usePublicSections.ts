/**
 * usePublicSections.ts — Custom hook that fetches the public homepage sections
 * from GET /api/public/sections once on mount.
 *
 * Returns:
 *  - sections: Record<"hero" | "storyboard" | "films", MediaItem[]>  (or null if loading/errored)
 *  - isLoading: boolean
 *  - error: string | null
 *
 * Falls back gracefully to null on network error so callers can use static data.
 */

import { useState, useEffect, useRef } from 'react';
import type { MediaItem, PublicSectionsResponse } from '../services/mediaApi';
import { fetchPublicSections } from '../services/mediaApi';

export type SectionsMap = Record<string, MediaItem[]>;

interface UsePublicSectionsResult {
  sections: SectionsMap | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePublicSections(): UsePublicSectionsResult {
  const [sections, setSections] = useState<SectionsMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCountRef = useRef(0);

  const load = () => {
    const callId = ++fetchCountRef.current;
    setIsLoading(true);
    setError(null);

    fetchPublicSections()
      .then((data: PublicSectionsResponse) => {
        if (callId !== fetchCountRef.current) return; // stale
        setSections(data.sections);
      })
      .catch((err: Error) => {
        if (callId !== fetchCountRef.current) return;
        // Graceful degradation — consumers fall back to static data
        setError(err.message);
        setSections(null);
      })
      .finally(() => {
        if (callId !== fetchCountRef.current) return;
        setIsLoading(false);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sections, isLoading, error, refetch: load };
}
