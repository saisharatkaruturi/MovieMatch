import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import SectionHeader from '../components/SectionHeader';
import { MotionSection } from '../components/MotionSection';
import { searchMovies } from '../services/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import { useEnrichedMovies } from '../hooks/useEnrichedMovies';
import './Search.css';

const TRENDING = [
  'Oppenheimer', 'Dune', 'Inception', 'Spirited Away',
  'Parasite', 'Interstellar', 'Pulp Fiction', 'The Godfather',
];

const RECENT_KEY = 'moviematch_recent_searches_v1';
const MAX_RECENT = 8;

const readRecent = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
};

const writeRecent = (list) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [recent, setRecent] = useState(readRecent);
  const [draft, setDraft] = useState(query);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const enrichedMovies = useEnrichedMovies(movies);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  // Feature-detect Web Speech API for voice search button.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(Boolean(SR));
    return undefined;
  }, []);

  useEffect(() => {
    const loadSearchResults = async () => {
      if (!debouncedQuery) {
        setMovies([]);
        setLoading(false);
        setError(null);
        setHasMore(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await searchMovies(debouncedQuery, 1);
        setMovies(data.results || []);
        setPage(1);
        setHasMore(data.total_pages > 1);
      } catch (err) {
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSearchResults();
  }, [debouncedQuery]);

  const loadMore = useCallback(async () => {
    if (!debouncedQuery || loading) return;
    try {
      setLoading(true);
      const next = page + 1;
      const data = await searchMovies(debouncedQuery, next);
      setMovies((prev) => [...prev, ...(data.results || [])]);
      setPage(next);
      setHasMore(data.total_pages > next);
    } catch (err) {
      setError('Failed to load more results.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, loading]);

  const submitQuery = useCallback((next) => {
    const q = (next ?? draft).trim();
    if (!q) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q });
    setRecent((prev) => {
      const without = prev.filter((r) => r.toLowerCase() !== q.toLowerCase());
      const updated = [q, ...without].slice(0, MAX_RECENT);
      writeRecent(updated);
      return updated;
    });
  }, [draft, setSearchParams]);

  const onVoiceClick = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setVoiceListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setDraft(transcript);
        submitQuery(transcript);
      }
    };
    recognition.onerror = () => setVoiceListening(false);
    recognition.onend = () => setVoiceListening(false);
    try {
      recognition.start();
    } catch {
      setVoiceListening(false);
    }
  }, [submitQuery]);

  // Cmd/Ctrl + K focuses the search input.
  useEffect(() => {
    const onKey = (e) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      submitQuery();
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  const clearRecent = useCallback(() => {
    setRecent([]);
    writeRecent([]);
  }, []);

  const showEmptyState = !loading && !error && enrichedMovies.length === 0 && debouncedQuery;
  const showInitialState = !debouncedQuery;
  const showResults = enrichedMovies.length > 0;

  const resultCount = useMemo(() => enrichedMovies.length, [enrichedMovies.length]);

  return (
    <div className="search">
      <div className="search__hero">
        <div className="search__hero-bg" aria-hidden="true">
          <div className="search__hero-glow search__hero-glow--cyan" />
          <div className="search__hero-glow search__hero-glow--violet" />
        </div>
        <div className="search__hero-inner">
          <motion.span
            className="search__kicker"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="search__kicker-dot" />
            Search the catalog
          </motion.span>
          <motion.h1
            className="search__title text-display"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            Find your next favorite
          </motion.h1>
          <motion.p
            className="search__sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            Search across 126 years of world cinema. Press
            <kbd className="search__kbd">⌘ K</kbd> or <kbd className="search__kbd">Ctrl K</kbd> to jump back here.
          </motion.p>

          <motion.div
            className={`search__input-wrap ${voiceListening ? 'is-listening' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="search__input-icon">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              className="search__input"
              placeholder="Search for a movie, director, or keyword…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Search movies"
              autoFocus
            />
            {draft && (
              <button
                type="button"
                className="search__clear"
                onClick={() => { setDraft(''); setSearchParams({}); inputRef.current?.focus(); }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            {voiceSupported && (
              <button
                type="button"
                className={`search__voice ${voiceListening ? 'is-on' : ''}`}
                onClick={onVoiceClick}
                aria-label="Voice search"
                title="Voice search"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <button
              type="button"
              className="search__submit"
              onClick={() => submitQuery()}
              disabled={!draft.trim()}
            >
              Search
            </button>
          </motion.div>

          {/* Recent + Trending chip rails */}
          <AnimatePresence>
            {showInitialState && (recent.length > 0 || TRENDING.length > 0) && (
              <motion.div
                className="search__suggestions"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35, delay: 0.25 }}
              >
                {recent.length > 0 && (
                  <div className="suggestion-row">
                    <div className="suggestion-row__head">
                      <span className="suggestion-row__label">Recent</span>
                      <button
                        type="button"
                        className="suggestion-row__clear"
                        onClick={clearRecent}
                      >
                        Clear
                      </button>
                    </div>
                    <div className="suggestion-row__chips">
                      {recent.map((r) => (
                        <button
                          key={r}
                          type="button"
                          className="suggestion-chip"
                          onClick={() => { setDraft(r); submitQuery(r); }}
                        >
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" strokeLinecap="round" />
                          </svg>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="suggestion-row">
                  <div className="suggestion-row__head">
                    <span className="suggestion-row__label">Trending</span>
                  </div>
                  <div className="suggestion-row__chips">
                    {TRENDING.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="suggestion-chip suggestion-chip--trending"
                        onClick={() => { setDraft(t); submitQuery(t); }}
                      >
                        <span className="suggestion-chip__fire" aria-hidden="true">🔥</span>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="search__container">
        {error && (
          <div className="search__error" role="alert">
            <strong>Search failed.</strong> {error}
          </div>
        )}

        {/* Initial: prompt to search */}
        {showInitialState && (
          <MotionSection className="search__hint-section">
            <div className="search__hint">
              <span className="search__hint-icon" aria-hidden="true">🎬</span>
              <h3 className="text-display">Type to start exploring</h3>
              <p>
                Try a director, an actor, a single word — even a mood. We'll
                find the closest matches from our world cinema catalog.
              </p>
            </div>
          </MotionSection>
        )}

        {/* Loading skeletons */}
        {loading && enrichedMovies.length === 0 && <SkeletonGrid count={12} />}

        {/* No results */}
        {showEmptyState && (
          <MotionSection className="search__empty-section">
            <div className="search__empty">
              <span className="search__empty-icon" aria-hidden="true">🔍</span>
              <h3 className="text-display">No matches for "{debouncedQuery}"</h3>
              <p>Try a different spelling, a broader keyword, or browse trending searches above.</p>
            </div>
          </MotionSection>
        )}

        {/* Results */}
        {showResults && (
          <MotionSection className="search__section">
            <SectionHeader
              icon="✨"
              title={`Results for "${debouncedQuery}"`}
              kicker={loading ? 'Loading more…' : `Showing ${resultCount} of possibly many`}
              meta={`${resultCount} titles`}
            />
            <div className="movies-grid">
              {enrichedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            {hasMore && (
              <div className="search__loadmore">
                <button
                  type="button"
                  className="detail-btn detail-btn--ghost"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading…' : 'Load more results'}
                </button>
              </div>
            )}
          </MotionSection>
        )}
      </div>
    </div>
  );
};

export default Search;
