import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { computeDeterministicCriticScores } from '../utils/deterministicScores';
import {
  readUserReviews,
  downloadReviewsJSON,
  importReviewsFromFile,
} from '../utils/reviewIO';
import { searchMovies, getImageUrl, getPlaceholderUrl } from '../services/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import SectionHeader from '../components/SectionHeader';
import { MotionSection } from '../components/MotionSection';
import './Review.css';

const REVIEWS_DATA = [
  { id: 1, movieTitle: 'Baahubali: The Beginning', movieId: 1, lang: 'Telugu', rating: 5, author: 'MovieEnthusiast', date: '2024-01-15', title: 'Epic Masterpiece!', text: 'An absolute visual spectacle! The storytelling, action sequences, and emotional depth are unmatched. SS Rajamouli proves why he is the king of Indian cinema. The cliffhanger ending still haunts me!', likes: 245, source: 'User Review' },
  { id: 2, movieTitle: 'The Godfather', movieId: 28, lang: 'English', rating: 5, author: 'Cinephile', date: '2024-02-20', title: 'Timeless Classic', text: "Francis Ford Coppola created a masterpiece that defines the gangster genre. Marlon Brando's Vito Corleone is legendary. Every frame is perfection.", likes: 189, source: 'User Review' },
  { id: 3, movieTitle: 'Parasite', movieId: 44, lang: 'Korean', rating: 5, author: 'FilmFan2024', date: '2024-03-10', title: 'Brilliantly Crafted', text: 'Bong Joon-ho proves that cinema has no language barriers. A perfect blend of dark comedy, thriller, and social commentary. The plot twists left me speechless!', likes: 312, source: 'User Review' },
  { id: 4, movieTitle: 'Spirited Away', movieId: 50, lang: 'Japanese', rating: 4, author: 'AnimationLover', date: '2024-01-28', title: 'Beautiful but Slow', text: 'The animation is gorgeous and the world-building is creative. However, the pacing felt dragging in the middle. Younger viewers might lose interest. Still a solid 4 stars.', likes: 87, source: 'User Review' },
  { id: 5, movieTitle: 'Dangal', movieId: 10, lang: 'Hindi', rating: 5, author: 'SportsFan', date: '2024-02-05', title: 'Great but Overlong', text: 'Aamir Khan delivers an Oscar-worthy performance. The emotional journey of a father training his daughters for wrestling glory is incredibly moving. Could have been trimmed by 20 minutes though.', likes: 156, source: 'User Review' },
  { id: 6, movieTitle: 'The Dark Knight', movieId: 30, lang: 'English', rating: 5, author: 'SuperheroFan', date: '2024-03-01', title: 'Batman at His Best', text: "Christopher Nolan redefined superhero movies. Heath Ledger's Joker is the greatest villain performance in cinema history. Intense and gripping!", likes: 423, source: 'User Review' },
  { id: 7, movieTitle: '3 Idiots', movieId: 12, lang: 'Hindi', rating: 5, author: 'EducationReformer', date: '2024-02-12', title: 'Must Watch for Students', text: 'This film questions the Indian education system while being thoroughly entertaining. "All is well" became a mantra for a generation!', likes: 567, source: 'User Review' },
  { id: 8, movieTitle: 'RRR', movieId: 3, lang: 'Telugu', rating: 5, author: 'ActionLover', date: '2024-01-20', title: 'Mass Entertainer', text: 'SS Rajamouli does it again! The interval block and "Naatu Naatu" dance are legendary. A perfect mix of action, drama, and friendship.', likes: 489, source: 'User Review' },
  { id: 9, movieTitle: 'Amélie', movieId: 61, lang: 'French', rating: 4, author: 'RomanticSoul', date: '2024-02-25', title: 'Charming but Pretentious', text: 'A whimsical journey through Paris with a lovable protagonist. Beautiful cinematography but the plot felt thin at times. Nice feel-good vibes though.', likes: 98, source: 'User Review' },
  { id: 10, movieTitle: 'Oldboy', movieId: 45, lang: 'Korean', rating: 5, author: 'ThrillerSeeker', date: '2024-03-05', title: 'Mind-Bending Revenge', text: 'The iconic corridor fight scene took my breath away. Park Chan-wook crafts a revenge thriller like no other. The twist destroyed me!', likes: 223, source: 'User Review' },
  { id: 11, movieTitle: 'City of God', movieId: 76, lang: 'Portuguese', rating: 5, author: 'WorldCinemaFan', date: '2024-03-15', title: 'Raw and Powerful', text: 'A harrowing look at life in the favelas of Rio. The filmmaking technique and performances are extraordinary. A difficult but essential watch.', likes: 134, source: 'User Review' },
];

// Critic scores from various sources (mock data - in production, use actual APIs)
const CRITIC_SCORES = {
  'Baahubali: The Beginning': { imdb: 8.3, rt: 87, mc: 72 },
  'The Godfather': { imdb: 9.2, rt: 97, mc: 100 },
  'Parasite': { imdb: 8.5, rt: 99, mc: 96 },
  'Spirited Away': { imdb: 8.6, rt: 97, mc: 96 },
  'Dangal': { imdb: 8.4, rt: 95, mc: 89 },
  'The Dark Knight': { imdb: 9.0, rt: 94, mc: 84 },
  '3 Idiots': { imdb: 8.4, rt: 91, mc: 79 },
  'RRR': { imdb: 8.1, rt: 94, mc: 75 },
  'Amélie': { imdb: 8.3, rt: 81, mc: 69 },
  'Oldboy': { imdb: 8.4, rt: 80, mc: 77 },
  'City of God': { imdb: 8.6, rt: 93, mc: 79 },
};

const CRITIC_SOURCES = [
  { name: 'IMDb', color: 'var(--accent-cyan)', url: 'https://www.imdb.com' },
  { name: 'Rotten Tomatoes', color: 'var(--accent-rose)', url: 'https://www.rottentomatoes.com' },
  { name: 'Metacritic', color: '#34D399', url: 'https://www.metacritic.com' },
  { name: 'Letterboxd', color: '#22D3EE', url: 'https://letterboxd.com' },
  { name: 'TV Guide', color: '#60A5FA', url: 'https://www.tvguide.com' },
];

const SENTIMENT = {
  5: { label: 'Masterpiece', color: 'var(--accent-amber)', emoji: '🏆' },
  4: { label: 'Great', color: 'var(--accent-cyan-bright)', emoji: '👍' },
  3: { label: 'Mixed', color: 'var(--text-secondary)', emoji: '🤔' },
  2: { label: 'Disappointing', color: '#FB923C', emoji: '😐' },
  1: { label: 'Skip', color: 'var(--accent-rose)', emoji: '👎' },
};

const RATING_LABELS = ['', 'Skip', 'Disappointing', 'Mixed', 'Great', 'Masterpiece'];

const USER_REVIEWS_KEY = 'moviematch_user_reviews_v1';

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

const Review = () => {
  const [reviews, setReviews] = useState(REVIEWS_DATA);
  const [filterLang, setFilterLang] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showForm, setShowForm] = useState(false);
  const [showCritics, setShowCritics] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newReview, setNewReview] = useState({ movie: '', movieId: null, rating: 5, title: '', text: '' });
  const [likes, setLikes] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  const importInputRef = useRef(null);
  const { toast } = useToast();
  const debouncedMovieQuery = useDebounce(newReview.movie, 300);

  // Aggregate stats
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, count: reviews.length, top: 0 };
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return {
      avg: Math.round((sum / reviews.length) * 10) / 10,
      count: reviews.length,
      top: reviews.filter((r) => r.rating >= 4).length,
    };
  }, [reviews]);

  // Load any user-submitted reviews from localStorage on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(USER_REVIEWS_KEY);
      if (!raw) return;
      const userReviews = JSON.parse(raw);
      if (Array.isArray(userReviews)) {
        setReviews((prev) => [...userReviews, ...prev]);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch TMDB suggestions when the user types in the movie input
  useEffect(() => {
    if (!debouncedMovieQuery || debouncedMovieQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const results = await searchMovies(debouncedMovieQuery, 1);
        if (!cancelled) setSuggestions((results || []).slice(0, 6));
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedMovieQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        const matchesLang = filterLang === 'all' || r.lang === filterLang;
        const matchesSearch = !searchQuery
          || r.movieTitle.toLowerCase().includes(searchQuery.toLowerCase())
          || r.title.toLowerCase().includes(searchQuery.toLowerCase())
          || r.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLang && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'likes') {
          const aLikes = (likes[a.id] ?? a.likes) || 0;
          const bLikes = (likes[b.id] ?? b.likes) || 0;
          return bLikes - aLikes;
        }
        if (sortBy === 'rating') return b.rating - a.rating;
        return new Date(b.date) - new Date(a.date);
      });
  }, [reviews, filterLang, searchQuery, sortBy, likes]);

  const languages = useMemo(
    () => ['all', ...Array.from(new Set(reviews.map((r) => r.lang)))],
    [reviews],
  );

  const criticMovies = useMemo(() => Object.keys(CRITIC_SCORES), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userReview = {
      id: `user-${Date.now()}`,
      movieTitle: newReview.movie.trim(),
      movieId: newReview.movieId,
      lang: 'Your Review',
      rating: newReview.rating,
      author: 'You',
      date: new Date().toISOString().split('T')[0],
      title: newReview.title.trim(),
      text: newReview.text.trim(),
      likes: 0,
      source: 'User Review',
    };
    setReviews((prev) => [userReview, ...prev]);
    setShowForm(false);
    setNewReview({ movie: '', movieId: null, rating: 5, title: '', text: '' });
    setSuggestions([]);

    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(USER_REVIEWS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const updated = Array.isArray(list) ? [userReview, ...list] : [userReview];
        window.localStorage.setItem(USER_REVIEWS_KEY, JSON.stringify(updated.slice(0, 50)));
      } catch {
        // ignore
      }
    }

    toast(`Your review of "${userReview.movieTitle}" is live`, { kind: 'success', title: 'Review posted' });
  };

  const handleLike = useCallback((review) => {
    setLikes((prev) => ({ ...prev, [review.id]: (prev[review.id] ?? review.likes) + 1 }));
  }, []);

  const selectSuggestion = (movie) => {
    setNewReview({
      ...newReview,
      movie: movie.title,
      movieId: movie.id,
    });
    setShowSuggestions(false);
  };

  // === Export / Import ===
  const userReviewsCount = useMemo(
    () => reviews.filter((r) => r.source === 'User Review' || String(r.id).startsWith('user-')).length,
    [reviews],
  );

  const handleExport = useCallback(() => {
    // Read directly from localStorage so we export exactly what's persisted,
    // independent of any in-flight state (likes, dedupe, etc.).
    const userReviews = readUserReviews();
    if (userReviews.length === 0) {
      toast('Nothing to export yet — write a review first.', { kind: 'info', title: 'Backup' });
      return;
    }
    try {
      downloadReviewsJSON(userReviews);
      toast(`Saved ${userReviews.length} review${userReviews.length === 1 ? '' : 's'} to your downloads.`, {
        kind: 'success',
        title: 'Backup downloaded',
      });
    } catch {
      toast('Could not generate the file. Try again or check browser settings.', {
        kind: 'error',
        title: 'Export failed',
      });
    }
  }, [toast]);

  const handleImportClick = useCallback(() => {
    if (importInputRef.current) importInputRef.current.click();
  }, []);

  const handleImportFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    // Always reset the input so the same file can be re-selected later.
    if (importInputRef.current) importInputRef.current.value = '';
    if (!file) return;

    const result = await importReviewsFromFile(file);
    if (!result.ok) {
      toast(result.reason || 'Could not read file.', { kind: 'error', title: 'Import failed' });
      return;
    }

    // Re-read storage and prepend to in-memory state so the new rows show
    // up immediately without a full reload.
    const merged = readUserReviews();
    const userRows = merged.filter((r) => r.source === 'User Review' || String(r.id).startsWith('user-'));
    setReviews((prev) => {
      // Preserve any non-user seeded critic rows (positions 0..N-1 by id)
      // and put user rows on top so they're newest-first.
      const seeded = prev.filter((r) => !(r.source === 'User Review' || String(r.id).startsWith('user-')));
      return [...userRows, ...seeded];
    });
    toast(
      `Restored ${result.count} review${result.count === 1 ? '' : 's'}. Older rows were merged, not replaced.`,
      { kind: 'success', title: 'Import complete' },
    );
  }, [toast]);

  return (
    <div className="review-page">
      {/* === Hero === */}
      <section className="review-header">
        <div className="review-header__bg" aria-hidden="true">
          <div className="review-header__glow review-header__glow--cyan" />
          <div className="review-header__glow review-header__glow--violet" />
          <div className="review-header__strip review-header__strip--top" />
          <div className="review-header__strip review-header__strip--bottom" />
        </div>
        <div className="review-header__inner">
          <div className="review-header__content">
            <motion.span
              className="review-header__kicker"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="review-header__kicker-dot" />
              Critical takes from around the world
            </motion.span>
            <motion.h1
              className="text-display"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              Movie Reviews & Critic Scores
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              Discover what critics and audiences are saying about movies from around the world.
            </motion.p>

            {/* === Hero stats === */}
            <motion.div
              className="review-header__stats"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="review-header__stat">
                <span className="review-header__stat-num text-display">{stats.count}</span>
                <span className="review-header__stat-label">Reviews</span>
              </div>
              <div className="review-header__stat-divider" aria-hidden="true" />
              <div className="review-header__stat">
                <span className="review-header__stat-num text-display">
                  {stats.avg.toFixed(1)}
                  <span className="review-header__stat-out">/5</span>
                </span>
                <span className="review-header__stat-label">Average Rating</span>
              </div>
              <div className="review-header__stat-divider" aria-hidden="true" />
              <div className="review-header__stat">
                <span className="review-header__stat-num text-display">{stats.top}</span>
                <span className="review-header__stat-label">Highly Rated</span>
              </div>
            </motion.div>
          </div>
          <motion.button
            type="button"
            className="write-review-btn"
            onClick={() => setShowForm((s) => !s)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showForm ? 'Close' : 'Write a Review'}
          </motion.button>

          <motion.div
            className="review-backup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            <button
              type="button"
              className="review-backup__btn"
              onClick={handleExport}
              title={`Download your ${userReviewsCount} review${userReviewsCount === 1 ? '' : 's'} as JSON`}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Backup
            </button>
            <button
              type="button"
              className="review-backup__btn"
              onClick={handleImportClick}
              title="Restore reviews from a JSON backup"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Restore
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="review-backup__input"
              onChange={handleImportFile}
              aria-hidden="true"
              tabIndex={-1}
            />
          </motion.div>
        </div>
      </section>

      <div className="review-container">
        {/* === Critic scores === */}
        <MotionSection className="review-section">
          <SectionHeader
            icon="⭐"
            title="Critics Scores"
            kicker="Aggregated ratings from leading review platforms."
            meta={`${criticMovies.length} films`}
          />
          <div className="critics-toolbar">
            <button
              type="button"
              className="critics-toggle"
              onClick={() => setShowCritics((s) => !s)}
              aria-expanded={showCritics}
            >
              {showCritics ? 'Hide' : 'Show'} critic scores
              <span className="critics-toggle__arrow" aria-hidden="true">{showCritics ? '▾' : '▸'}</span>
            </button>
          </div>
          <AnimatePresence initial={false}>
            {showCritics && (
              <motion.div
                className="critics-grid"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {criticMovies.map((movie) => {
                  // Movies with explicit CRITIC_SCORES use those, others fall back
                  // to deterministic hashes so scores are stable between renders.
                  const explicit = CRITIC_SCORES[movie];
                  const scores = explicit || computeDeterministicCriticScores({ id: movie, title: movie });
                  const avg = ((scores.imdb + scores.rt / 10 + scores.mc / 10) / 3).toFixed(1);
                  return (
                    <article key={movie} className="critic-card">
                      <div className="critic-card__head">
                        <h3 className="critic-card__title">{movie}</h3>
                        <div className="critic-card__avg">
                          <span className="critic-card__avg-num text-display">{avg}</span>
                          <span className="critic-card__avg-label">avg</span>
                        </div>
                      </div>
                      <div className="critic-card__scores">
                        <a
                          href={`https://www.imdb.com/find?q=${encodeURIComponent(movie)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="critic-score critic-score--imdb"
                        >
                          <span className="score-label">IMDb</span>
                          <span className="score-value text-mono-num">{scores.imdb}</span>
                        </a>
                        <a
                          href={`https://www.rottentomatoes.com/search?search=${encodeURIComponent(movie)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="critic-score critic-score--rt"
                        >
                          <span className="score-label">RT</span>
                          <span className="score-value text-mono-num">{scores.rt}%</span>
                        </a>
                        <a
                          href={`https://www.metacritic.com/search/all/${encodeURIComponent(movie)}/results`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="critic-score critic-score--mc"
                        >
                          <span className="score-label">MC</span>
                          <span className="score-value text-mono-num">{scores.mc}</span>
                        </a>
                      </div>
                      <div className="critic-card__links">
                        <a
                          href={`https://letterboxd.com/search/${encodeURIComponent(movie)}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Letterboxd
                        </a>
                        <span className="separator" aria-hidden="true">•</span>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(movie + ' review')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Google
                        </a>
                      </div>
                    </article>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </MotionSection>

        {/* === External review links === */}
        <MotionSection className="review-section">
          <SectionHeader
            icon="🔗"
            title="Find Professional Reviews"
            kicker="Check major review platforms for in-depth critic takes."
          />
          <div className="external-links">
            {CRITIC_SOURCES.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
                style={{ '--dot-color': source.color }}
              >
                <span className="external-link__dot" />
                {source.name}
              </a>
            ))}
          </div>
        </MotionSection>

        {/* === Submit form === */}
        <AnimatePresence initial={false}>
          {showForm && (
            <motion.div
              key="review-form"
              className="review-form-container"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <form className="review-form" onSubmit={handleSubmit}>
                <h3 className="review-form__title text-display">Share Your Review</h3>
                <p className="review-form__sub">
                  Your review joins the MovieMatch community feed. Postings stay local to this device.
                </p>

                <div className="form-group" ref={suggestionRef}>
                  <label htmlFor="rev-movie">Movie Name</label>
                  <input
                    id="rev-movie"
                    type="text"
                    placeholder="Search a movie to review…"
                    value={newReview.movie}
                    onChange={(e) => {
                      setNewReview({ ...newReview, movie: e.target.value, movieId: null });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    autoComplete="off"
                    required
                  />
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        className="review-suggestions"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                      >
                        {suggestions.map((m) => {
                          const img = getImageUrl(m.poster_path, 'w92') || getPlaceholderUrl(m.title);
                          const year = m.release_date ? m.release_date.split('-')[0] : '—';
                          return (
                            <button
                              type="button"
                              key={m.id}
                              className="review-suggestions__item"
                              onClick={() => selectSuggestion(m)}
                            >
                              <img src={img} alt="" className="review-suggestions__img" />
                              <div className="review-suggestions__meta">
                                <span className="review-suggestions__title">{m.title}</span>
                                <span className="review-suggestions__sub">
                                  {year} · {(m.original_language || '').toUpperCase()} · ★ {m.vote_average?.toFixed(1) || '—'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group">
                  <label>Rating — <span className="form-rating-label">{RATING_LABELS[newReview.rating]}</span></label>
                  <div className="rating-select">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`rating-star ${star <= newReview.rating ? 'is-active' : ''}`}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        onMouseEnter={(e) => e.currentTarget.classList.add('is-hover')}
                        onMouseLeave={(e) => e.currentTarget.classList.remove('is-hover')}
                        aria-label={`${star} star${star === 1 ? '' : 's'}`}
                        aria-pressed={star <= newReview.rating}
                      >
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                    <span className="rating-select__label text-mono-num">
                      {newReview.rating}/5
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="rev-title">Review Title</label>
                  <input
                    id="rev-title"
                    type="text"
                    placeholder="Give your review a title…"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rev-text">Your Review</label>
                  <textarea
                    id="rev-text"
                    placeholder="Share your thoughts about the movie…"
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    rows={5}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Submit Review
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Controls === */}
        <MotionSection className="review-section">
          <SectionHeader
            icon="💬"
            title="User Reviews"
            kicker="Reviews from the MovieMatch community."
            meta={`${filteredReviews.length} of ${reviews.length} shown`}
          />
          <div className="review-controls">
            <div className="search-group">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="review-controls__icon">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                placeholder="Search reviews, titles, or authors…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="select-group">
              <label htmlFor="rev-lang">Language</label>
              <select id="rev-lang" value={filterLang} onChange={(e) => setFilterLang(e.target.value)}>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === 'all' ? 'All Languages' : lang}
                  </option>
                ))}
              </select>
            </div>
            <div className="select-group">
              <label htmlFor="rev-sort">Sort by</label>
              <select id="rev-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recent">Most Recent</option>
                <option value="likes">Most Liked</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {searchQuery && filteredReviews.length === 0 && (
            <div className="review-empty">
              <span aria-hidden="true">🔍</span>
              <p>No reviews found for "{searchQuery}". Try a different search term.</p>
            </div>
          )}

          <div className="reviews-grid">
            <AnimatePresence mode="popLayout">
              {filteredReviews.map((review, index) => {
                const likedCount = likes[review.id] ?? review.likes;
                const sent = SENTIMENT[review.rating] || SENTIMENT[3];
                return (
                  <motion.article
                    key={review.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index * 0.04, 0.4),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="review-card"
                    style={{ '--sentiment-color': sent.color }}
                  >
                    <div className="review-card__head">
                      <span className="review-card__lang">{review.lang}</span>
                      <span className="review-card__sentiment">
                        <span aria-hidden="true">{sent.emoji}</span>
                        {sent.label}
                      </span>
                    </div>

                    <div className="review-card__rating-row">
                      <div className="review-rating" aria-label={`${review.rating} of 5 stars`}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < review.rating ? 'is-on' : ''}`}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </span>
                        ))}
                      </div>
                      <span className="review-card__rating-num text-mono-num">{review.rating}.0</span>
                    </div>

                    <h3 className="review-card__title">{review.title}</h3>
                    <p className="review-card__movie">
                      {review.movieId && review.source !== 'User Review' ? (
                        <Link to={`/movie/${review.movieId}`} className="review-card__movie-link">
                          {review.movieTitle}
                        </Link>
                      ) : (
                        review.movieTitle
                      )}
                    </p>
                    <p className="review-card__text">{review.text}</p>

                    <div className="review-card__footer">
                      <span className="review-author">by {review.author}</span>
                      <div className="review-actions">
                        <span className="review-date text-mono-num">{formatDate(review.date)}</span>
                        <button
                          type="button"
                          className={`like-btn ${likedCount > (review.likes || 0) ? 'is-active' : ''}`}
                          onClick={() => handleLike(review)}
                          aria-label="Like review"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          <span className="text-mono-num">{likedCount}</span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        </MotionSection>
      </div>
    </div>
  );
};

export default Review;