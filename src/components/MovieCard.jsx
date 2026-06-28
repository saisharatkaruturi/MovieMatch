import { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getImageUrl, getPlaceholderUrl } from '../services/tmdb';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import './MovieCard.css';

// Format a runtime (minutes) into "Xh Ym" — empty when unknown.
const formatRuntime = (mins) => {
  if (!mins || mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const MovieCard = memo(({ movie }) => {
  const [hovered, setHovered] = useState(false);
  const {
    isFavorite, isInWatchlist, toggleFavorite, toggleWatchlist, computeMatchScore,
  } = useFavorites();
  const { toast } = useToast();

  if (!movie) return null;

  const {
    id, title, poster_path, backdrop_path, vote_average,
    release_date, overview, original_language, genre_ids, genres,
    runtime, category, isOscar, vote_count,
  } = movie;

  const displayRating = vote_average > 0
    ? (vote_average > 9.0 ? '9.0' : vote_average.toFixed(1))
    : null;

  const year = release_date ? release_date.split('-')[0] : null;
  const imageUrl = getImageUrl(poster_path);
  const backdropUrl = getImageUrl(backdrop_path, 'w780');
  const placeholderUrl = getPlaceholderUrl(title);
  const runtimeStr = formatRuntime(runtime);

  // Resolve up to 2 genre names for the chip row.
  const genreNames = (() => {
    if (Array.isArray(genres) && genres.length) {
      if (typeof genres[0] === 'string') return genres.slice(0, 2);
      return genres.slice(0, 2).map((g) => g.name).filter(Boolean);
    }
    if (Array.isArray(genre_ids) && genre_ids.length) {
      // Map common IDs to names without depending on a static map
      const quick = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
        80: 'Crime', 18: 'Drama', 10751: 'Family', 14: 'Fantasy',
        36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery',
        10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV', 53: 'Thriller',
        10752: 'War', 37: 'Western', 99: 'Documentary',
      };
      return genre_ids.slice(0, 2).map((gid) => quick[gid]).filter(Boolean);
    }
    return [];
  })();

  // AI Match Score — only when the user has at least one favorite.
  const matchScore = computeMatchScore(movie);

  const fav = isFavorite(id);
  const inWl = isInWatchlist(id);

  const handleFavorite = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(movie);
    toast(
      fav ? `Removed "${title}" from favorites` : `Added "${title}" to favorites`,
      { kind: fav ? 'info' : 'success', title: fav ? 'Removed' : 'Favorited' },
    );
  }, [fav, movie, title, toggleFavorite, toast]);

  const handleWatchlist = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
    toast(
      inWl ? `Removed "${title}" from watchlist` : `Saved "${title}" for later`,
      { kind: inWl ? 'info' : 'success', title: inWl ? 'Removed' : 'Watchlist' },
    );
  }, [inWl, movie, title, toggleWatchlist, toast]);

  const handleShare = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/movie/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `Check out ${title} on MovieMatch`, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast('Link copied to clipboard', { kind: 'success' });
      } else {
        toast(`Share: ${url}`, { kind: 'info' });
      }
    } catch {
      // user cancelled the share sheet — silent
    }
  }, [id, title, toast]);

  return (
    <motion.div
      className="movie-card"
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link to={`/movie/${id}`} className="movie-card__link" aria-label={title}>
        <div className="movie-card__poster">
          {/* Backdrop fades in on hover for a cinematic preview */}
          {backdropUrl && (
            <img
              className="movie-card__backdrop"
              src={backdropUrl}
              alt=""
              aria-hidden="true"
              loading="lazy"
              style={{ opacity: hovered ? 1 : 0 }}
            />
          )}
          <img
            className="movie-card__img"
            src={imageUrl || placeholderUrl}
            alt={title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = placeholderUrl;
            }}
          />
          <div className="movie-card__poster-shade" />

          {/* === Top row badges === */}
          {displayRating && (
            <span className="movie-card__rating text-mono-num" aria-label={`Rating ${displayRating}`}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {displayRating}
            </span>
          )}
          {original_language && (
            <span className="movie-card__lang">{original_language.toUpperCase()}</span>
          )}
          {isOscar && (
            <span className="movie-card__oscar">
              <span aria-hidden="true">🏆</span>
              {category || 'Oscar'}
            </span>
          )}
          {!isOscar && category && (
            <span className="movie-card__category">{category}</span>
          )}
          {matchScore > 0 && (
            <span
              className="movie-card__match text-mono-num"
              aria-label={`${matchScore} percent match for you`}
              title="AI match score based on your favorites"
            >
              <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden="true">
                <path d="M12 2 14.5 9 22 9.5 16 14.5 18 22 12 18 6 22 8 14.5 2 9.5 9.5 9z" />
              </svg>
              {matchScore}% match
            </span>
          )}

          {/* === Hover action bar === */}
          <div className="movie-card__actions" aria-hidden={!hovered}>
            <button
              type="button"
              className={`movie-card__action ${fav ? 'is-active' : ''}`}
              onClick={handleFavorite}
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
              title={fav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className={`movie-card__action ${inWl ? 'is-active' : ''}`}
              onClick={handleWatchlist}
              aria-label={inWl ? 'Remove from watchlist' : 'Add to watchlist'}
              title={inWl ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill={inWl ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="movie-card__action"
              onClick={handleShare}
              aria-label="Share movie"
              title="Share"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Gradient overlay at the bottom for genre chips */}
          <div className="movie-card__poster-fade" aria-hidden="true" />
        </div>

        <div className="movie-card__info">
          <h3 className="movie-card__title">{title}</h3>
          <div className="movie-card__meta">
            {year && <span className="movie-card__year text-mono-num">{year}</span>}
            {runtimeStr && (
              <>
                <span className="movie-card__dot" aria-hidden="true">·</span>
                <span className="movie-card__runtime text-mono-num">{runtimeStr}</span>
              </>
            )}
            {vote_count > 100 && (
              <>
                <span className="movie-card__dot" aria-hidden="true">·</span>
                <span className="movie-card__votes text-mono-num">
                  {(vote_count / 1000).toFixed(1)}k votes
                </span>
              </>
            )}
          </div>
          {genreNames.length > 0 && (
            <div className="movie-card__genres">
              {genreNames.map((g) => (
                <span key={g} className="movie-card__genre">{g}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;