import { useState, useEffect, useRef } from 'react';
import MovieCard from '../components/MovieCard';
import GenreFilter from '../components/GenreFilter';
import {
  fetchMoviesByGenre,
  fetchPopularMovies,
  fetchMoviesByLanguage,
} from '../services/tmdb';
import { useGenres } from '../context/GenreContext';
import { useEnrichedMovies } from '../hooks/useEnrichedMovies';
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

// Horizontal Movie Carousel Component
const MovieCarousel = ({ title, movies, icon }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [movies]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="movie-carousel">
      <h2 className="movie-carousel__title">
        {icon && <span className="section-icon">{icon}</span>}
        {title}
      </h2>
      <div className="movie-carousel__wrapper">
        {canScrollLeft && (
          <button
            className="movie-carousel__btn movie-carousel__btn--left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}
        <div className="movie-carousel__container" ref={scrollContainerRef}>
          {movies.map((movie) => (
            <div key={movie.id} className="movie-carousel__item">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        {canScrollRight && (
          <button
            className="movie-carousel__btn movie-carousel__btn--right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
};

const Home = ({ selectedLanguage = 'all' }) => {
  const [movieSections, setMovieSections] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedGenres } = useGenres();

  const enrichedAllMovies = useEnrichedMovies(allMovies);
  const enrichedSections = useEnrichedMovies(movieSections);

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

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">
            {LANGUAGE_NAMES[selectedLanguage] || 'World Cinema'}
          </h1>
          <p className="hero__subtitle">
            {selectedLanguage === 'all'
              ? 'Movies from Around the World (1900 - 2026)'
              : `Best ${LANGUAGE_NAMES[selectedLanguage]} Movies (1900 - 2026)`}
          </p>
        </div>
      </section>

      <div className="home__container">
        <GenreFilter />

        {loading && (
          <div className="loading">
            <div className="loading__spinner"></div>
            <p>Loading movies...</p>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {!loading && !error && enrichedSections.length === 0 && enrichedAllMovies.length === 0 && (
          <div className="empty">No movies found in this language. Try selecting "Home" for all movies.</div>
        )}

        {/* Simple grid for "Home" (All movies) - no classification */}
        {!loading && !error && enrichedAllMovies.length > 0 && (
          <div className="home__section">
            <h2 className="home__section-title">{sectionTitle}</h2>
            <div className="movies-grid">
              {enrichedAllMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}

        {/* Classified horizontal carousels for specific languages */}
        {!loading && !error && enrichedSections.length > 0 && (
          <div className="home__sections">
            {enrichedSections
              .filter(section => section.movies.length > 0)
              .map((section, index) => (
                <MovieCarousel
                  key={`${section.title}-${index}`}
                  title={section.title}
                  movies={section.movies}
                  icon={section.icon}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
