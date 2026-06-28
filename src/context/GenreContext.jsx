import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchGenres } from '../services/tmdb';

const GenreContext = createContext();

const STORAGE_KEY = 'moviematch_genre_filter_v1';

export const GenreProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  // matchMode controls whether the filter is OR ("any") or AND ("all").
  const [matchMode, setMatchMode] = useState(() => {
    if (typeof window === 'undefined') return 'any';
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.matchMode === 'all' ? 'all' : 'any';
    } catch {
      return 'any';
    }
  });

  useEffect(() => {
    let cancelled = false;
    const loadGenres = async () => {
      const genresList = await fetchGenres();
      if (!cancelled) setGenres(genresList);
    };
    loadGenres();
    return () => {
      cancelled = true;
    };
  }, []);

  // Memoize callbacks so consumers don't re-render on every provider render.
  const toggleGenre = useCallback((genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  }, []);

  const clearGenres = useCallback(() => setSelectedGenres([]), []);
  const toggleMatchMode = useCallback(() => {
    setMatchMode((prev) => (prev === 'any' ? 'all' : 'any'));
  }, []);

  // Persist match mode (genre selection is intentionally NOT persisted to avoid
  // surprises when the user navigates back to home later).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ matchMode }));
    } catch {
      // ignore
    }
  }, [matchMode]);

  // Memoize the context value object so the whole tree doesn't re-render
  // on every state update — only components consuming the changed slice do.
  const value = useMemo(
    () => ({
      genres,
      selectedGenres,
      matchMode,
      toggleMatchMode,
      toggleGenre,
      clearGenres,
    }),
    [genres, selectedGenres, matchMode, toggleMatchMode, toggleGenre, clearGenres],
  );

  return (
    <GenreContext.Provider value={value}>
      {children}
    </GenreContext.Provider>
  );
};

export const useGenres = () => useContext(GenreContext);