// ============================================================================
// FeaturedMovie — the "🎬 Featured Today" card shown above the GenreFilter.
//
// This is a presentation-only component. All logic (which movie, when does
// it change, the countdown) lives in useFeaturedMovie + featuredMovieService.
// ============================================================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getImageUrl, getPlaceholderUrl } from '../services/tmdb';
import './FeaturedMovie.css';

const FALLBACK_GENRE_NAME = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror',
  10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

const humanGenreList = (movie) => {
  if (!movie) return [];
  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres.slice(0, 3).map((g) => g.name).filter(Boolean);
  }
  if (Array.isArray(movie.genre_ids)) {
    return movie.genre_ids
      .slice(0, 3)
      .map((id) => FALLBACK_GENRE_NAME[id])
      .filter(Boolean);
  }
  return [];
};

const formatYear = (iso) => {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})/);
  return m ? m[1] : null;
};

const formatRating = (n) => {
  if (typeof n !== 'number' || Number.isNaN(n)) return null;
  return n.toFixed(1);
};

/**
 * @param {object}  props
 * @param {object|null} props.featured   Selected movie or null
 * @param {string}  props.countdown      "07h 42m 18s" string
 * @param {boolean} props.fallback       True when no movie is available
 * @param {string}  props.language       Current language code (e.g. "en")
 * @param {number}  props.poolSize       For a small "X titles" footnote
 */
const FeaturedMovie = ({
  featured,
  countdown,
  fallback,
  language,
  poolSize,
}) => {
  // === Empty / fallback state ===
  if (fallback) {
    return (
      <motion.section
        className="featured-today"
        aria-label="Featured movie"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="featured-today__card featured-today__card--empty">
          <div className="featured-today__empty-icon" aria-hidden="true">🎬</div>
          <div className="featured-today__empty-body">
            <p className="featured-today__empty-kicker">Featured Today</p>
            <p className="featured-today__empty-msg">
              No featured movie available for this language.
            </p>
            <p className="featured-today__countdown-line">
              <span className="featured-today__countdown-label">Changes in</span>
              <span className="featured-today__countdown text-mono-num">{countdown}</span>
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  // === Populated state ===
  const year = formatYear(featured.release_date);
  const rating = formatRating(featured.vote_average);
  const genres = humanGenreList(featured);
  const posterSrc = getImageUrl(featured.poster_path, 'w500')
    || getPlaceholderUrl(featured.title);
  const overview = featured.overview
    ? (featured.overview.length > 240
        ? `${featured.overview.slice(0, 237).trim()}…`
        : featured.overview)
    : null;

  return (
    <motion.section
      className="featured-today"
      aria-label="Featured movie"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="featured-today__card">
        <Link
          to={`/movie/${featured.id}`}
          className="featured-today__poster-link"
          aria-label={`View details for ${featured.title}`}
        >
          <img
            className="featured-today__poster"
            src={posterSrc}
            alt={`Poster for ${featured.title}`}
            loading="lazy"
          />
        </Link>

        <div className="featured-today__body">
          <div className="featured-today__kicker">
            <span className="featured-today__kicker-dot" aria-hidden="true" />
            <span>🎬 Featured Today</span>
          </div>

          <h2 className="featured-today__title text-display">
            <Link to={`/movie/${featured.id}`} className="featured-today__title-link">
              {featured.title || 'Untitled'}
            </Link>
          </h2>

          <div className="featured-today__chips">
            {year && (
              <span className="featured-today__chip featured-today__chip--muted text-mono-num">
                {year}
              </span>
            )}
            {rating !== null && (
              <span
                className="featured-today__chip featured-today__chip--rating text-mono-num"
                title="TMDB user rating"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {rating}
              </span>
            )}
            {genres.map((g) => (
              <span key={g} className="featured-today__chip">{g}</span>
            ))}
          </div>

          {overview && (
            <p className="featured-today__overview">{overview}</p>
          )}

          <div className="featured-today__footer">
            <Link
              to={`/movie/${featured.id}`}
              className="featured-today__cta hero__btn hero__btn--ghost"
            >
              <span>View Details</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <p className="featured-today__countdown-line">
              <span className="featured-today__countdown-label">Changes in</span>
              <span className="featured-today__countdown text-mono-num">{countdown}</span>
            </p>
          </div>

          {poolSize > 1 && language && (
            <p className="featured-today__pool-note">
              Rotating through {poolSize} curated titles in this language.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturedMovie;