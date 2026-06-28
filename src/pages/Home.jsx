import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import SectionHeader from '../components/SectionHeader';
import { MotionSection } from '../components/MotionSection';
import GenreFilter from '../components/GenreFilter';
import {
  fetchMoviesByGenre,
  fetchMoviesByLanguage,
} from '../services/tmdb';
import { useGenres } from '../context/GenreContext';
import { useFavorites } from '../context/FavoritesContext';
import { useEnrichedMovies } from '../hooks/useEnrichedMovies';
import { useFeaturedMovie } from '../hooks/useFeaturedMovie';
import FeaturedMovie from '../components/FeaturedMovie';
import './Home.css';

const LANGUAGE_NAMES = {
  all: 'World Cinema',
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  mr: 'Marathi',
  pa: 'Punjabi',
  gu: 'Gujarati',
  bn: 'Bengali',
  or: 'Odia',
  bh: 'Bhojpuri',
  de: 'German',
  fr: 'French',
  it: 'Italian',
  ko: 'Korean',
  ja: 'Japanese',
  zh: 'Chinese',
  es: 'Spanish',
  pt: 'Portuguese',
  ru: 'Russian',
  da: 'Danish',
};

// Horizontal Movie Carousel — drag-friendly with arrow buttons.
const MovieCarousel = ({ title, movies, icon }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [movies]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.min(560, scrollContainerRef.current.clientWidth * 0.85);
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="movie-carousel" aria-label={title}>
      <SectionHeader icon={icon} title={title} meta={`${movies.length} titles`} />
      <div className="movie-carousel__wrap">
        {canScrollLeft && (
          <motion.button
            className="movie-carousel__btn movie-carousel__btn--left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        )}
        <div className="movie-carousel__container" ref={scrollContainerRef}>
          {movies.map((movie) => (
            <div key={movie.id} className="movie-carousel__item">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        {canScrollRight && (
          <motion.button
            className="movie-carousel__btn movie-carousel__btn--right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        )}
      </div>
    </section>
  );
};

const Home = ({ selectedLanguage = 'all' }) => {
  const [movieSections, setMovieSections] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedGenres } = useGenres();
  const { favorites } = useFavorites();

  const enrichedAllMovies = useEnrichedMovies(allMovies);
  const enrichedSections = useEnrichedMovies(movieSections);

  // Pool for the "Featured Today" selector. Same dataset the rest of the
  // page is rendering — no extra TMDB call. When the user filters by
  // genre the data is split across sections, so we flatten.
  const featuredPoolSource = useMemo(() => {
    if (allMovies.length > 0) return allMovies;
    const flat = [];
    for (const section of movieSections) {
      if (Array.isArray(section?.movies)) flat.push(...section.movies);
    }
    return flat;
  }, [allMovies, movieSections]);

  const {
    featured: featuredMovie,
    poolSize: featuredPoolSize,
    fallback: featuredFallback,
    countdown: featuredCountdown,
  } = useFeaturedMovie({
    allMovies: featuredPoolSource,
    language: selectedLanguage,
  });

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        let data;

        if (selectedGenres.length > 0) {
          data = await fetchMoviesByGenre(selectedGenres, selectedLanguage);
        } else {
          data = await fetchMoviesByLanguage(selectedLanguage);
        }

        // Handle both classified (sections) and flat (array) responses
        if (data.sections) {
          setMovieSections(data.sections);
          setAllMovies([]);
        } else if (Array.isArray(data)) {
          setAllMovies(data);
          setMovieSections([]);
        } else {
          console.warn('Home: Unexpected data format:', data);
        }
      } catch (err) {
        setError('Failed to load movies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [selectedLanguage, selectedGenres]);

  const sectionTitle = selectedGenres.length > 0
    ? `${LANGUAGE_NAMES[selectedLanguage] || 'Movies'} by Genre`
    : `${LANGUAGE_NAMES[selectedLanguage] || 'World Cinema'} Movies`;

  const heroTitle = LANGUAGE_NAMES[selectedLanguage] || 'World Cinema';
  const heroKicker = selectedLanguage === 'all'
    ? 'A cinematic journey through 126 years of world cinema.'
    : `The best of ${LANGUAGE_NAMES[selectedLanguage]} cinema, hand-picked.`;
  const heroTagline = favorites.length > 0
    ? `${favorites.length} favorite${favorites.length === 1 ? '' : 's'} fueling your AI match scores.`
    : 'Discover, favorite, and build a watchlist tailored to you.';

  return (
    <div className="home">
      {/* === Cinematic hero === */}
      <section className="hero" aria-label="Featured">
        <div className="hero__bg" aria-hidden="true">
          {/* CSS-only "World Cinema" composition — see .hero__bg-cinema */}
          <div className="hero__bg-cinema" />
          <div className="hero__bg-overlay" />
          <div className="hero__bg-glow hero__bg-glow--cyan" />
          <div className="hero__bg-glow hero__bg-glow--violet" />
        </div>

        <div className="hero__inner">
          <motion.span
            className="hero__kicker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="hero__kicker-dot" />
            Now playing in your cinematic library
          </motion.span>

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {heroTitle}
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {heroKicker}
          </motion.p>

          <motion.div
            className="hero__tagline"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="hero__ai-badge" aria-hidden="true">✨</span>
            <span>{heroTagline}</span>
          </motion.div>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <a href="#home-sections" className="hero__btn hero__btn--primary">
              <span>Browse all movies</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </motion.div>

          <motion.div
            className="hero__stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="hero__stat">
              <span className="hero__stat-num text-mono-num">1900–2026</span>
              <span className="hero__stat-label">Across the decades</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-num text-mono-num">20+</span>
              <span className="hero__stat-label">Languages curated</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-num text-mono-num">AI</span>
              <span className="hero__stat-label">Match scoring</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === Daily featured movie — rotates per language per day === */}
      <FeaturedMovie
        featured={featuredMovie}
        countdown={featuredCountdown}
        fallback={featuredFallback}
        language={selectedLanguage}
        poolSize={featuredPoolSize}
      />

      <div className="home__container" id="home-sections">
        <GenreFilter />

        {loading && <SkeletonGrid count={12} />}

        {error && (
          <div className="home__error" role="alert">
            <strong>Oops.</strong> {error}
          </div>
        )}

        {!loading && !error && enrichedSections.length === 0 && enrichedAllMovies.length === 0 && (
          <div className="home__empty">
            <span className="home__empty-icon" aria-hidden="true">🎬</span>
            <h3 className="text-display">No movies in this slice yet</h3>
            <p>Try switching back to <strong>Home</strong> for the full catalog or pick different genres.</p>
          </div>
        )}

        {/* Simple grid for "Home" (All movies) - no classification */}
        {!loading && !error && enrichedAllMovies.length > 0 && (
          <MotionSection className="home__section">
            <SectionHeader
              icon="🎬"
              title={sectionTitle}
              kicker={`${enrichedAllMovies.length} movies curated for this view`}
              meta={`${enrichedAllMovies.length} titles`}
            />
            <div className="movies-grid">
              {enrichedAllMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </MotionSection>
        )}

        {/* Classified horizontal carousels for specific languages */}
        {!loading && !error && enrichedSections.length > 0 && (
          <div className="home__sections">
            {enrichedSections
              .filter((section) => section.movies.length > 0)
              .map((section, index) => (
                <MotionSection key={`${section.title}-${index}`}>
                  <MovieCarousel
                    title={section.title}
                    movies={section.movies}
                    icon={section.icon}
                  />
                </MotionSection>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;