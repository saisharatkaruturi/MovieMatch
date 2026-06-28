import { motion } from 'framer-motion';
import { useGenres } from '../context/GenreContext';
import './GenreFilter.css';

const GenreFilter = () => {
  const { genres, selectedGenres, matchMode, toggleMatchMode, toggleGenre, clearGenres } = useGenres();

  return (
    <div className="genre-filter">
      <div className="genre-filter__header">
        <div className="genre-filter__heading">
          <span className="genre-filter__icon" aria-hidden="true">🎭</span>
          <div>
            <h3 className="genre-filter__title text-display">Filter by genre</h3>
            <p className="genre-filter__sub">
              {selectedGenres.length === 0
                ? 'Pick what you love — we\'ll match movies to your taste.'
                : `${selectedGenres.length} selected · ${matchMode === 'all' ? 'must match all' : 'match any'}`}
            </p>
          </div>
        </div>
        <div className="genre-filter__actions">
          <button
            type="button"
            className="genre-filter__mode"
            aria-pressed={matchMode === 'all'}
            onClick={toggleMatchMode}
            title={`Switch to ${matchMode === 'any' ? 'AND' : 'OR'} matching`}
          >
            <span className={`genre-filter__mode-dot ${matchMode === 'all' ? 'is-on' : ''}`} aria-hidden="true" />
            {matchMode === 'any' ? 'Any' : 'All'}
          </button>
          {selectedGenres.length > 0 && (
            <button onClick={clearGenres} className="genre-filter__clear">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="genre-filter__chips">
        {genres.map((genre) => {
          const active = selectedGenres.includes(genre.id);
          return (
            <motion.button
              key={genre.id}
              type="button"
              onClick={() => toggleGenre(genre.id)}
              className={`genre-chip ${active ? 'genre-chip--active' : ''}`}
              layout
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              {active && (
                <span className="genre-chip__check" aria-hidden="true">✓</span>
              )}
              {genre.name}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default GenreFilter;