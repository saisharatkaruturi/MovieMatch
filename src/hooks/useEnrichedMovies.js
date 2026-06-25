import { useState, useEffect, useRef } from 'react';
import { enrichMoviesInBackground } from '../services/tmdb';

// Wraps an array of movies and fills in missing poster_path values by looking
// each one up on TMDB (cached in localStorage). Returns the input array
// immediately so the UI renders without waiting; updates state as posters
// come in so cards transition from placeholder to real image.
export const useEnrichedMovies = (movies) => {
  const [enriched, setEnriched] = useState(movies);
  const lastKey = useRef('');

  useEffect(() => {
    if (!movies) {
      setEnriched(movies);
      return;
    }

    // Skip work when the input hasn't changed (same movies, same poster state)
    const key = movies.map((m) => `${m.id}:${m.poster_path || ''}`).join('|');
    if (key === lastKey.current) return;
    lastKey.current = key;

    setEnriched(movies);
    if (!movies.length) return;

    const needsEnrichment = movies.some((m) => !m.poster_path);
    if (!needsEnrichment) return;

    let cancelled = false;
    enrichMoviesInBackground(
      movies,
      (next) => {
        if (!cancelled) setEnriched(next);
      },
      4,
    ).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [movies]);

  return enriched;
};