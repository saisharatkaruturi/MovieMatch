import { useState, useEffect, useRef } from 'react';
import { enrichPeopleInBackground } from '../services/tmdb';

// Wraps an array of people and fills in missing profile_path values by
// looking each one up on TMDB (cached in localStorage). Same shape as
// useEnrichedMovies but for /search/person.
export const useEnrichedPeople = (people) => {
  const [enriched, setEnriched] = useState(people);
  const lastKey = useRef('');

  useEffect(() => {
    if (!people) {
      setEnriched(people);
      return;
    }

    const key = people.map((p) => `${p.id}:${p.profile_path || ''}`).join('|');
    if (key === lastKey.current) return;
    lastKey.current = key;

    setEnriched(people);
    if (!people.length) return;

    const needsEnrichment = people.some((p) => !p.profile_path);
    if (!needsEnrichment) return;

    let cancelled = false;
    enrichPeopleInBackground(
      people,
      (next) => {
        if (!cancelled) setEnriched(next);
      },
      4,
    ).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [people]);

  return enriched;
};