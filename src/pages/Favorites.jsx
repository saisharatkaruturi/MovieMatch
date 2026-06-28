import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import SectionHeader from '../components/SectionHeader';
import { MotionSection } from '../components/MotionSection';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import './Favorites.css';

const TABS = [
  { key: 'favorites', label: 'Favorites', icon: '❤️' },
  { key: 'watchlist', label: 'Watchlist', icon: '🔖' },
];

const SORTS = [
  { key: 'recent', label: 'Recently Added' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'title', label: 'A → Z' },
];

const Favorites = () => {
  const {
    favorites, watchlist,
    removeFavorite, removeWatchlist,
  } = useFavorites();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('favorites');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const list = activeTab === 'favorites' ? favorites : watchlist;
  const remove = activeTab === 'favorites' ? removeFavorite : removeWatchlist;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let out = list;
    if (q) {
      out = out.filter((m) => {
        const title = (m.title || '').toLowerCase();
        const lang = (m.original_language || '').toLowerCase();
        return title.includes(q) || lang.includes(q);
      });
    }
    const sorted = [...out];
    if (sortBy === 'rating') {
      sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sortBy === 'title') {
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      // 'recent' — favorites/watchlist arrays already prepend new items
    }
    return sorted;
  }, [list, sortBy, searchQuery]);

  const handleClearAll = () => {
    if (activeTab === 'favorites') {
      if (favorites.length === 0) return;
      favorites.forEach((m) => removeFavorite(m.id));
      toast(`Cleared ${favorites.length} favorite${favorites.length === 1 ? '' : 's'}`, {
        kind: 'info',
        title: 'Favorites cleared',
      });
    } else {
      if (watchlist.length === 0) return;
      watchlist.forEach((m) => removeWatchlist(m.id));
      toast(`Cleared ${watchlist.length} watchlist item${watchlist.length === 1 ? '' : 's'}`, {
        kind: 'info',
        title: 'Watchlist cleared',
      });
    }
  };

  const handleBrowse = () => navigate('/');

  return (
    <div className="favorites">
      {/* === Hero === */}
      <section className="favorites__hero">
        <div className="favorites__hero-bg" aria-hidden="true">
          <div className="favorites__hero-glow favorites__hero-glow--cyan" />
          <div className="favorites__hero-glow favorites__hero-glow--violet" />
        </div>
        <div className="favorites__hero-inner">
          <motion.span
            className="favorites__kicker"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="favorites__kicker-dot" />
            Your personal cinema
          </motion.span>

          <motion.h1
            className="text-display"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            My Favorites
          </motion.h1>

          <motion.p
            className="favorites__sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            Movies you have favorited and want to watch. Stored locally on this device — no
            account required.
          </motion.p>

          <motion.div
            className="favorites__stats"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="favorites__stat">
              <span className="favorites__stat-num text-mono-num text-display">{favorites.length}</span>
              <span className="favorites__stat-label">Favorites</span>
            </div>
            <div className="favorites__stat-divider" aria-hidden="true" />
            <div className="favorites__stat">
              <span className="favorites__stat-num text-mono-num text-display">{watchlist.length}</span>
              <span className="favorites__stat-label">Watchlist</span>
            </div>
            {favorites.length > 0 && (
              <>
                <div className="favorites__stat-divider" aria-hidden="true" />
                <div className="favorites__stat">
                  <span className="favorites__stat-num text-mono-num text-display">
                    {Math.round(
                      favorites.reduce((acc, m) => acc + (m.vote_average || 0), 0) / favorites.length * 10,
                    ) / 10}
                  </span>
                  <span className="favorites__stat-label">Avg Rating</span>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      <div className="favorites__container">
        {/* === Tabs + controls === */}
        <MotionSection className="favorites__section">
          <div className="favorites__tabs" role="tablist" aria-label="My lists">
            {TABS.map((t) => {
              const count = t.key === 'favorites' ? favorites.length : watchlist.length;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`favorites__tab ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  <span aria-hidden="true">{t.icon}</span>
                  {t.label}
                  <span className="favorites__tab-count text-mono-num">{count}</span>
                </button>
              );
            })}
          </div>

          {list.length > 0 && (
            <div className="favorites__controls">
              <div className="favorites__search">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}…`}
                  className="favorites__search-input"
                  aria-label={`Search ${activeTab}`}
                />
              </div>
              <div className="favorites__sort">
                <label htmlFor="fav-sort">Sort</label>
                <select
                  id="fav-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="favorites__sort-select"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="favorites__clear"
                onClick={handleClearAll}
                aria-label={`Clear all ${activeTab}`}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Clear all
              </button>
            </div>
          )}
        </MotionSection>

        {/* === List === */}
        <AnimatePresence mode="wait">
          {list.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <EmptyState
                tab={activeTab}
                onBrowse={handleBrowse}
              />
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="no-match"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="favorites__empty"
            >
              <span aria-hidden="true">🔍</span>
              <h3 className="text-display">No matches for &ldquo;{searchQuery}&rdquo;</h3>
              <p>Try a different search or clear the filter.</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SectionHeader
                icon={activeTab === 'favorites' ? '❤️' : '🔖'}
                title={activeTab === 'favorites' ? 'Your Favorites' : 'Your Watchlist'}
                kicker={`${filtered.length} of ${list.length} ${activeTab === 'favorites' ? 'favorited' : 'saved'} ${list.length === 1 ? 'movie' : 'movies'}`}
                meta={`${filtered.length}`}
              />
              <div className="favorites__grid">
                <AnimatePresence mode="popLayout">
                  {filtered.map((movie, index) => (
                    <motion.div
                      key={movie.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{
                        duration: 0.35,
                        delay: Math.min(index * 0.04, 0.4),
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <MovieCard movie={movie} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Quick links to discovery === */}
        {(favorites.length > 0 || watchlist.length > 0) && (
          <MotionSection className="favorites__quick">
            <h2 className="text-display favorites__quick-title">Keep exploring</h2>
            <div className="favorites__quick-grid">
              <Link to="/" className="favorites__quick-card">
                <span className="favorites__quick-icon" aria-hidden="true">🎬</span>
                <span className="favorites__quick-text">
                  <span className="favorites__quick-name">Browse Trending</span>
                  <span className="favorites__quick-desc">See what is playing now</span>
                </span>
              </Link>
              <Link to="/search" className="favorites__quick-card">
                <span className="favorites__quick-icon" aria-hidden="true">🔍</span>
                <span className="favorites__quick-text">
                  <span className="favorites__quick-name">Search the catalog</span>
                  <span className="favorites__quick-desc">Find films by title, actor, or director</span>
                </span>
              </Link>
              <Link to="/analysis" className="favorites__quick-card">
                <span className="favorites__quick-icon" aria-hidden="true">📊</span>
                <span className="favorites__quick-text">
                  <span className="favorites__quick-name">Movie Analysis</span>
                  <span className="favorites__quick-desc">Insights into world cinema</span>
                </span>
              </Link>
            </div>
          </MotionSection>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ tab, onBrowse }) => (
  <div className="favorites__empty">
    <span className="favorites__empty-icon" aria-hidden="true">
      {tab === 'favorites' ? '💔' : '📭'}
    </span>
    <h2 className="text-display">
      {tab === 'favorites'
        ? 'No favorites yet'
        : 'Your watchlist is empty'}
    </h2>
    <p>
      {tab === 'favorites'
        ? 'Hover any movie card and click the heart to add it here. Your favorites power the AI match score on every card.'
        : 'Save movies you want to watch later. Hover any movie card and click the bookmark icon.'}
    </p>
    <button
      type="button"
      className="favorites__empty-btn"
      onClick={onBrowse}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Browse movies
    </button>
  </div>
);

export default Favorites;