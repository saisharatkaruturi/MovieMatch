import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { computeMatchScore as computeMatch } from '../utils/deterministicScores';

const FavoritesContext = createContext(null);

const FAV_KEY = 'moviematch_favorites_v1';
const WL_KEY = 'moviematch_watchlist_v1';

const safeRead = (key) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const safeWrite = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private-mode errors
  }
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => safeRead(FAV_KEY));
  const [watchlist, setWatchlist] = useState(() => safeRead(WL_KEY));

  // Persist on change
  useEffect(() => { safeWrite(FAV_KEY, favorites); }, [favorites]);
  useEffect(() => { safeWrite(WL_KEY, watchlist); }, [watchlist]);

  const isFavorite = useCallback(
    (id) => favorites.some((m) => m.id === id),
    [favorites],
  );
  const isInWatchlist = useCallback(
    (id) => watchlist.some((m) => m.id === id),
    [watchlist],
  );

  const addFavorite = useCallback((movie) => {
    if (!movie?.id) return;
    setFavorites((prev) => (prev.some((m) => m.id === movie.id) ? prev : [movie, ...prev]));
  }, []);
  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => prev.filter((m) => m.id !== id));
  }, []);
  const toggleFavorite = useCallback((movie) => {
    if (!movie?.id) return;
    setFavorites((prev) => {
      if (prev.some((m) => m.id === movie.id)) {
        return prev.filter((m) => m.id !== movie.id);
      }
      return [movie, ...prev];
    });
  }, []);

  const addWatchlist = useCallback((movie) => {
    if (!movie?.id) return;
    setWatchlist((prev) => (prev.some((m) => m.id === movie.id) ? prev : [movie, ...prev]));
  }, []);
  const removeWatchlist = useCallback((id) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== id));
  }, []);
  const toggleWatchlist = useCallback((movie) => {
    if (!movie?.id) return;
    setWatchlist((prev) => {
      if (prev.some((m) => m.id === movie.id)) {
        return prev.filter((m) => m.id !== movie.id);
      }
      return [movie, ...prev];
    });
  }, []);

  // AI Match Score bound to the current favorites list. Stable per (movie, favorites).
  const computeMatchScore = useCallback(
    (movie) => computeMatch(movie, favorites),
    [favorites],
  );

  const value = useMemo(
    () => ({
      favorites,
      watchlist,
      isFavorite,
      isInWatchlist,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      addWatchlist,
      removeWatchlist,
      toggleWatchlist,
      computeMatchScore,
    }),
    [
      favorites, watchlist,
      isFavorite, isInWatchlist,
      addFavorite, removeFavorite, toggleFavorite,
      addWatchlist, removeWatchlist, toggleWatchlist,
      computeMatchScore,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    // Provide a safe no-op default so components rendered outside the provider
    // (e.g. in isolated storybooks) don't crash.
    return {
      favorites: [], watchlist: [],
      isFavorite: () => false, isInWatchlist: () => false,
      addFavorite: () => {}, removeFavorite: () => {}, toggleFavorite: () => {},
      addWatchlist: () => {}, removeWatchlist: () => {}, toggleWatchlist: () => {},
      computeMatchScore: () => 0,
    };
  }
  return ctx;
};

export const useWatchlist = () => {
  const { watchlist, isInWatchlist, addWatchlist, removeWatchlist, toggleWatchlist } = useFavorites();
  return { watchlist, isInWatchlist, addWatchlist, removeWatchlist, toggleWatchlist };
};