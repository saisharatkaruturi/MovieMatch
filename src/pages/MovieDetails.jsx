import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import WhereToWatch from '../components/WhereToWatch';
import SkeletonCard from '../components/SkeletonCard';
import SectionHeader from '../components/SectionHeader';
import { MotionSection } from '../components/MotionSection';
import {
  fetchMovieDetails,
  fetchSimilarMovies,
  getImageUrl,
  enrichMoviePoster,
  enrichPersonProfile,
} from '../services/tmdb';
import { useEnrichedMovies } from '../hooks/useEnrichedMovies';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import {
  computeDeterministicCriticScores,
  computeMatchScore,
  computeMovieStats,
} from '../utils/deterministicScores';
import './MovieDetails.css';

const OVERVIEW_COLLAPSE_AT = 320;

const formatRuntime = (m) => {
  if (!m) return 'N/A';
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
};

const formatCurrency = (n) => {
  if (!n || n === 0) return '—';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(false);

  const { favorites, isFavorite, isInWatchlist, toggleFavorite, toggleWatchlist, favorites: favList } = useFavorites();
  const { toast } = useToast();

  const enrichedMovie = useEnrichedMovies(movie ? [movie] : []);
  const enrichedSimilar = useEnrichedMovies(similarMovies);
  const detailMovie = enrichedMovie[0] || movie;

  useEffect(() => {
    const loadMovieData = async () => {
      try {
        setLoading(true);
        setError(null);
        setShowReviews(false);
        setOverviewExpanded(false);
        const [movieData, similar] = await Promise.all([
          fetchMovieDetails(id),
          fetchSimilarMovies(id),
        ]);

        setMovie(movieData);
        setSimilarMovies(similar.slice(0, 12));

        // Best-effort: enrich the detail movie and any cast/crew members that
        // are missing profile_path. Fire-and-forget — UI already rendered
        // with initials; updates flow through re-renders triggered by the
        // enrichment promises.
        if (movieData && !movieData.poster_path) {
          enrichMoviePoster(movieData).then((enriched) => {
            if (enriched?.poster_path) setMovie(enriched);
          }).catch(() => {});
        }
        if (Array.isArray(movieData?.credits?.cast)) {
          movieData.credits.cast.forEach((person) => {
            if (!person.profile_path) {
              enrichPersonProfile(person)
                .then((enriched) => {
                  if (enriched?.profile_path) {
                    setMovie((prev) => prev ? {
                      ...prev,
                      credits: {
                        ...prev.credits,
                        cast: prev.credits.cast.map((c) =>
                          c.id === person.id ? { ...c, profile_path: enriched.profile_path } : c
                        ),
                      },
                    } : prev);
                  }
                })
                .catch(() => {});
            }
          });
        }
        if (Array.isArray(movieData?.credits?.crew)) {
          movieData.credits.crew.forEach((person) => {
            if (!person.profile_path) {
              enrichPersonProfile(person)
                .then((enriched) => {
                  if (enriched?.profile_path) {
                    setMovie((prev) => prev ? {
                      ...prev,
                      credits: {
                        ...prev.credits,
                        crew: prev.credits.crew.map((c) =>
                          c.id === person.id ? { ...c, profile_path: enriched.profile_path } : c
                        ),
                      },
                    } : prev);
                  }
                })
                .catch(() => {});
            }
          });
        }
      } catch (err) {
        setError('Failed to load movie details.');
      } finally {
        setLoading(false);
      }
    };

    loadMovieData();
  }, [id]);

  const scores = useMemo(
    () => (detailMovie ? computeDeterministicCriticScores(detailMovie) : null),
    [detailMovie],
  );
  const stats = useMemo(
    () => (detailMovie ? computeMovieStats(detailMovie) : null),
    [detailMovie],
  );
  const matchScore = useMemo(
    () => (detailMovie && favorites.length > 0 ? computeMatchScore(detailMovie, favorites) : 0),
    [detailMovie, favorites],
  );

  const director = detailMovie?.credits?.crew?.find((c) => c.job === 'Director');
  const writers = detailMovie?.credits?.crew?.filter(
    (c) => c.job === 'Writer' || c.job === 'Screenplay' || c.job === 'Story',
  ) || [];
  const producers = detailMovie?.credits?.crew?.filter((c) => c.job === 'Producer')?.slice(0, 3) || [];

  const isFav = detailMovie ? isFavorite(detailMovie.id) : false;
  const isWL = detailMovie ? isInWatchlist(detailMovie.id) : false;

  const handleToggleFavorite = useCallback(() => {
    if (!detailMovie) return;
    toggleFavorite(detailMovie);
    toast(
      isFav ? `Removed "${detailMovie.title}" from favorites` : `Added "${detailMovie.title}" to favorites`,
      { kind: isFav ? 'info' : 'success', title: isFav ? 'Removed' : 'Favorited' },
    );
  }, [detailMovie, isFav, toggleFavorite, toast]);

  const handleToggleWatchlist = useCallback(() => {
    if (!detailMovie) return;
    toggleWatchlist(detailMovie);
    toast(
      isWL ? `Removed from watchlist` : `Saved to watchlist`,
      { kind: isWL ? 'info' : 'success', title: 'Watchlist' },
    );
  }, [detailMovie, isWL, toggleWatchlist, toast]);

  const handleShare = useCallback(async () => {
    if (!detailMovie) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: detailMovie.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard', { kind: 'success', title: 'Share' });
    } catch {
      toast('Could not share', { kind: 'error', title: 'Share' });
    }
  }, [detailMovie, toast]);

  if (loading) {
    return (
      <div className="movie-details movie-details--loading">
        <div className="movie-details__backdrop-skeleton" aria-hidden="true" />
        <div className="movie-details__container">
          <div className="movie-details__skel-grid">
            <SkeletonCard />
            <div className="movie-details__skel-info">
              <div className="skel-line skel-line--xl" />
              <div className="skel-line skel-line--md" />
              <div className="skel-line skel-line--sm" />
              <div className="skel-line skel-line--lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !detailMovie) {
    return (
      <div className="movie-details">
        <div className="movie-details__error" role="alert">
          <span className="movie-details__error-icon" aria-hidden="true">⚠</span>
          <h3>{error || 'Movie not found'}</h3>
          <p>It may have been removed, or the link is broken.</p>
          <Link to="/" className="movie-details__back">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const year = detailMovie.release_date?.split('-')[0] || 'N/A';
  const runtime = formatRuntime(detailMovie.runtime);
  const heroBackdrop = getImageUrl(detailMovie.backdrop_path, 'w1280');
  const heroPoster = getImageUrl(detailMovie.poster_path, 'w500');
  const overview = detailMovie.overview || 'No overview available.';
  const overviewNeedsTruncation = overview.length > OVERVIEW_COLLAPSE_AT;
  const trailer = detailMovie.videos?.results?.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'),
  ) || detailMovie.videos?.results?.find((v) => v.site === 'YouTube');

  return (
    <div className="movie-details">
      {/* === Cinematic backdrop === */}
      <div className="movie-details__hero" aria-hidden="true">
        {heroBackdrop ? (
          <div
            className="movie-details__hero-img"
            style={{ backgroundImage: `url(${heroBackdrop})` }}
          />
        ) : (
          <div className="movie-details__hero-img movie-details__hero-img--fallback" />
        )}
        <div className="movie-details__hero-mask" />
        <div className="movie-details__hero-glow movie-details__hero-glow--cyan" />
        <div className="movie-details__hero-glow movie-details__hero-glow--violet" />
      </div>

      <div className="movie-details__container">
        <Link to="/" className="movie-details__back-link">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to Home</span>
        </Link>

        {/* === Hero panel: poster + sticky info === */}
        <div className="movie-details__hero-panel">
          <motion.div
            className="movie-details__poster"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {heroPoster ? (
              <img src={heroPoster} alt={detailMovie.title} loading="lazy" />
            ) : (
              <div className="movie-details__poster-fallback">
                <span>{detailMovie.title?.[0] || '🎬'}</span>
              </div>
            )}
          </motion.div>

          <motion.div
            className="movie-details__info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="movie-details__header">
              <h1 className="movie-details__title text-display">{detailMovie.title}</h1>
              {detailMovie.tagline && (
                <p className="movie-details__tagline">“{detailMovie.tagline}”</p>
              )}
            </div>

            <div className="movie-details__meta">
              <span className="meta-pill text-mono-num">{year}</span>
              <span className="meta-pill text-mono-num">{runtime}</span>
              <span className="meta-pill meta-pill--rating text-mono-num">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
                {detailMovie.vote_average > 0 ? detailMovie.vote_average.toFixed(1) : '—'}
              </span>
              {detailMovie.original_language && (
                <span className="meta-pill text-mono-num">{detailMovie.original_language.toUpperCase()}</span>
              )}
              {detailMovie.certification || detailMovie.release_dates?.results?.[0]?.release_dates?.[0]?.certification ? (
                <span className="meta-pill meta-pill--cert text-mono-num">
                  {detailMovie.certification
                    || detailMovie.release_dates?.results?.[0]?.release_dates?.[0]?.certification
                    || 'NR'}
                </span>
              ) : null}
            </div>

            {detailMovie.genres?.length > 0 && (
              <div className="movie-details__genres">
                {detailMovie.genres.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {matchScore > 0 && (
              <motion.div
                className="movie-details__ai"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="movie-details__ai-score">
                  <span className="movie-details__ai-num text-mono-num">{matchScore}</span>
                  <span className="movie-details__ai-suffix">/ 100</span>
                </div>
                <div className="movie-details__ai-text">
                  <span className="movie-details__ai-badge">✨ AI Match</span>
                  <span className="movie-details__ai-help">
                    Based on your {favList.length} favorite{favList.length === 1 ? '' : 's'} and genre overlap.
                  </span>
                </div>
              </motion.div>
            )}

            <div className="movie-details__actions">
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`detail-btn detail-btn--primary ${isFav ? 'is-active' : ''}`}
                aria-pressed={isFav}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {isFav ? 'Favorited' : 'Favorite'}
              </button>
              <button
                type="button"
                onClick={handleToggleWatchlist}
                className={`detail-btn detail-btn--ghost ${isWL ? 'is-active' : ''}`}
                aria-pressed={isWL}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill={isWL ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {isWL ? 'In Watchlist' : 'Watchlist'}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="detail-btn detail-btn--ghost"
                aria-label="Share movie"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" strokeLinecap="round" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" strokeLinecap="round" />
                </svg>
                Share
              </button>
            </div>
          </motion.div>
        </div>

        {/* === Critic ratings === */}
        {scores && (
          <MotionSection className="movie-details__section">
            <SectionHeader
              icon="⭐"
              title="Critics Ratings"
              kicker="Aggregated scores from leading review platforms."
            />
            <div className="ratings-grid">
              <div className="rating-box rating-box--imdb">
                <span className="rating-source">IMDb</span>
                <span className="rating-score text-mono-num">{scores.imdb}<small>/10</small></span>
                <span className="rating-count text-mono-num">
                  {detailMovie.vote_count?.toLocaleString() || '0'} votes
                </span>
              </div>
              <div className="rating-box rating-box--rt">
                <span className="rating-source">Rotten Tomatoes</span>
                <span className="rating-score text-mono-num">{scores.rt}<small>%</small></span>
                <span className="rating-count">Critics</span>
              </div>
              <div className="rating-box rating-box--mc">
                <span className="rating-source">Metacritic</span>
                <span className="rating-score text-mono-num">{scores.mc}<small>/100</small></span>
                <span className="rating-count">Metascore</span>
              </div>
            </div>
          </MotionSection>
        )}

        {/* === Overview === */}
        <MotionSection className="movie-details__section">
          <SectionHeader icon="📖" title="Overview" />
          <p
            className={`movie-details__overview ${overviewExpanded ? 'is-expanded' : ''}`}
          >
            {overview}
          </p>
          {overviewNeedsTruncation && (
            <button
              type="button"
              className="movie-details__readmore"
              onClick={() => setOverviewExpanded((s) => !s)}
            >
              {overviewExpanded ? 'Show less' : 'Read more'}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d={overviewExpanded ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </MotionSection>

        {/* === Where to Watch === */}
        <MotionSection className="movie-details__section">
          <WhereToWatch movieId={detailMovie.id} movieTitle={detailMovie.title} />
        </MotionSection>

        {/* === Trailer (if any) === */}
        {trailer?.key && (
          <MotionSection className="movie-details__section">
            <SectionHeader icon="🎬" title="Trailer" kicker="Watch the official trailer on YouTube." />
            <div className="movie-details__trailer">
              <iframe
                title={`${detailMovie.title} trailer`}
                src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </MotionSection>
        )}

        {/* === Statistics === */}
        {stats && (
          <MotionSection className="movie-details__section">
            <SectionHeader
              icon="📊"
              title="Audience & Statistics"
              kicker="Snapshot of how this film is being received."
            />
            <div className="stats-grid">
              <div className="stat">
                <div className="stat__label">Audience</div>
                <div className="stat__bar">
                  <motion.span
                    className="stat__fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stats.audience}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="stat__num text-mono-num">{stats.audience}%</div>
              </div>
              <div className="stat">
                <div className="stat__label">Critics</div>
                <div className="stat__bar">
                  <motion.span
                    className="stat__fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stats.critics}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="stat__num text-mono-num">{stats.critics}%</div>
              </div>
              <div className="stat">
                <div className="stat__label">Freshness</div>
                <div className="stat__bar">
                  <motion.span
                    className="stat__fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stats.freshness}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="stat__num text-mono-num">{stats.freshness}%</div>
              </div>
              <div className="stat">
                <div className="stat__label">Replay Value</div>
                <div className="stat__bar">
                  <motion.span
                    className="stat__fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stats.replay}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="stat__num text-mono-num">{stats.replay}%</div>
              </div>
            </div>
          </MotionSection>
        )}

        {/* === Cast (horizontal scroll) === */}
        {detailMovie.credits?.cast?.length > 0 && (
          <MotionSection className="movie-details__section">
            <SectionHeader
              icon="🎭"
              title="Top Cast"
              meta={`${detailMovie.credits.cast.length} members`}
            />
            <div className="cast-rail">
              {detailMovie.credits.cast.slice(0, 16).map((actor) => (
                <button
                  type="button"
                  key={actor.id}
                  className="cast-card"
                  onClick={() => navigate(`/artist/${actor.id}`)}
                >
                  <div className="cast-card__photo">
                    {actor.profile_path ? (
                      <img src={getImageUrl(actor.profile_path, 'w185')} alt={actor.name} loading="lazy" />
                    ) : (
                      <div className="cast-card__placeholder">
                        <span>
                          {actor.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="cast-card__name">{actor.name}</p>
                  {actor.character && (
                    <p className="cast-card__character">{actor.character}</p>
                  )}
                </button>
              ))}
            </div>
          </MotionSection>
        )}

        {/* === Crew (chips) === */}
        {(director || writers.length > 0 || producers.length > 0) && (
          <MotionSection className="movie-details__section">
            <SectionHeader
              icon="🛠"
              title="Crew"
              kicker="The people behind the camera."
            />
            <div className="crew-grid">
              {director && (
                <button
                  type="button"
                  className="crew-card"
                  onClick={() => navigate(`/artist/${director.id}`)}
                >
                  <span className="crew-card__job">Director</span>
                  <span className="crew-card__name">{director.name}</span>
                </button>
              )}
              {writers.slice(0, 3).map((w) => (
                <button
                  type="button"
                  key={`${w.id}-${w.job}`}
                  className="crew-card"
                  onClick={() => navigate(`/artist/${w.id}`)}
                >
                  <span className="crew-card__job">{w.job}</span>
                  <span className="crew-card__name">{w.name}</span>
                </button>
              ))}
              {producers.map((p) => (
                <button
                  type="button"
                  key={`${p.id}-p`}
                  className="crew-card"
                  onClick={() => navigate(`/artist/${p.id}`)}
                >
                  <span className="crew-card__job">Producer</span>
                  <span className="crew-card__name">{p.name}</span>
                </button>
              ))}
            </div>
          </MotionSection>
        )}

        {/* === Reviews === */}
        {detailMovie.reviews?.results?.length > 0 && (
          <MotionSection className="movie-details__section">
            <div className="movie-details__reviews-header">
              <SectionHeader
                icon="💬"
                title="User Reviews"
                meta={`${detailMovie.reviews.results.length} reviews`}
              />
              <button
                type="button"
                className="detail-btn detail-btn--ghost"
                onClick={() => setShowReviews((s) => !s)}
              >
                {showReviews ? 'Hide all' : `Show all (${detailMovie.reviews.results.length})`}
              </button>
            </div>
            {showReviews && (
              <div className="reviews-list">
                {detailMovie.reviews.results.slice(0, 5).map((review, index) => (
                  <article key={index} className="critic-review">
                    <header className="critic-review__head">
                      <div className="critic-review__author">
                        {review.author_details?.avatar_path ? (
                          <img
                            src={
                              review.author_details.avatar_path.startsWith('http')
                                ? review.author_details.avatar_path
                                : getImageUrl(review.author_details.avatar_path, 'w45')
                            }
                            alt={review.author}
                            className="critic-review__avatar"
                            loading="lazy"
                          />
                        ) : (
                          <span className="critic-review__avatar-fallback">
                            {(review.author || 'A')[0].toUpperCase()}
                          </span>
                        )}
                        <span className="critic-review__name">
                          {review.author || 'Anonymous'}
                        </span>
                      </div>
                      {review.author_details?.rating ? (
                        <span className="critic-review__rating text-mono-num">
                          ★ {review.author_details.rating}/10
                        </span>
                      ) : null}
                    </header>
                    <p className="critic-review__content">
                      {review.content?.substring(0, 500)}
                      {review.content?.length > 500 ? '…' : ''}
                    </p>
                    {review.url && (
                      <a
                        href={review.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="critic-review__link"
                      >
                        Read full review →
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </MotionSection>
        )}

        {/* === Financials === */}
        {(detailMovie.budget > 0 || detailMovie.revenue > 0) && (
          <MotionSection className="movie-details__section">
            <SectionHeader icon="💰" title="Box Office" />
            <div className="finance-grid">
              <div className="finance-item">
                <span className="finance-item__label">Budget</span>
                <span className="finance-item__value text-mono-num">
                  {formatCurrency(detailMovie.budget)}
                </span>
              </div>
              <div className="finance-item">
                <span className="finance-item__label">Revenue</span>
                <span className="finance-item__value text-mono-num">
                  {formatCurrency(detailMovie.revenue)}
                </span>
              </div>
              {detailMovie.budget > 0 && detailMovie.revenue > 0 && (
                <div className="finance-item">
                  <span className="finance-item__label">Multiplier</span>
                  <span className="finance-item__value text-mono-num">
                    {(detailMovie.revenue / detailMovie.budget).toFixed(2)}×
                  </span>
                </div>
              )}
            </div>
          </MotionSection>
        )}

        {/* === Similar === */}
        {enrichedSimilar.length > 0 && (
          <MotionSection className="movie-details__section">
            <SectionHeader
              icon="✨"
              title="Similar Movies"
              kicker="If you liked this, you'll probably enjoy these."
              meta={`${enrichedSimilar.length} titles`}
            />
            <div className="movies-grid">
              {enrichedSimilar.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </MotionSection>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;