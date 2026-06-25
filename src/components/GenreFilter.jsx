import { useGenres } from '../context/GenreContext';
import './GenreFilter.css';

const GenreFilter = () => {
  const { genres, selectedGenres, toggleGenre, clearGenres } = useGenres();

  return (
    <div className="genre-filter">
      <div className="genre-filter__header">
        <h3 className="genre-filter__title">Filter by Genre</h3>
        {selectedGenres.length > 0 && (
          <button onClick={clearGenres} className="genre-filter__clear">
            Clear All
          </button>
        )}
      </div>
      <div className="genre-filter__chips">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => toggleGenre(genre.id)}
            className={`genre-chip ${
              selectedGenres.includes(genre.id) ? 'genre-chip--active' : ''
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreFilter;
