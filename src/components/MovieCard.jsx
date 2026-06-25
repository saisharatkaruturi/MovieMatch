import { Link } from 'react-router-dom';
import { getImageUrl, getPlaceholderUrl } from '../services/tmdb';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const { id, title, poster_path, vote_average, release_date, overview, original_language, category, isOscar } = movie;

  const displayRating = vote_average > 0 ? (vote_average > 8.8 ? '8.8' : vote_average.toFixed(1)) : null;
  const imageUrl = getImageUrl(poster_path);
  const placeholderUrl = getPlaceholderUrl(title);

  return (
    <Link to={`/movie/${id}`} className="movie-card">
      <div className="movie-card__poster">
        <img
          src={imageUrl || placeholderUrl}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.target.src = placeholderUrl;
          }}
        />
        {displayRating && (
          <span className="movie-card__rating">
            ★ {displayRating}
          </span>
        )}
        <span className="movie-card__lang">
          {original_language?.toUpperCase()}
        </span>
        {isOscar && (
          <span className="movie-card__oscar">
            🏆 {category}
          </span>
        )}
        {!isOscar && category && (
          <span className="movie-card__category">
            {category}
          </span>
        )}
      </div>
      <div className="movie-card__info">
        <h3 className="movie-card__title">{title}</h3>
        <span className="movie-card__year">
          {release_date ? release_date.split('-')[0] : 'N/A'}
        </span>
      </div>
    </Link>
  );
};

export default MovieCard;
