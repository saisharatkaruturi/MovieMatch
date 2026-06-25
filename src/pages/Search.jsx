import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { searchMovies } from '../services/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import { useEnrichedMovies } from '../hooks/useEnrichedMovies';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const enrichedMovies = useEnrichedMovies(movies);

  useEffect(() => {
    const loadSearchResults = async () => {
      if (!debouncedQuery) {
        setMovies([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await searchMovies(debouncedQuery, 1);
        setMovies(data.results || []);
        setPage(1);
        setHasMore(data.total_pages > 1);
      } catch (err) {
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSearchResults();
  }, [debouncedQuery]);

  const loadMore = async () => {
    try {
      setLoading(true);
      const data = await searchMovies(debouncedQuery, page + 1);
      setMovies((prev) => [...prev, ...(data.results || [])]);
      setPage((prev) => prev + 1);
      setHasMore(data.total_pages > page + 1);
    } catch (err) {
      setError('Failed to load more results.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search">
      <div className="search__container">
        <h1 className="search__title">
          Search Results for <span className="search__query">"{query}"</span>
        </h1>

        {loading && movies.length === 0 && (
          <div className="loading">
            <div className="loading__spinner"></div>
            <p>Searching...</p>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {!loading && !error && movies.length === 0 && debouncedQuery && (
          <div className="empty">
            <p>No movies found for "{debouncedQuery}"</p>
            <p className="empty__hint">Try different keywords</p>
          </div>
        )}

        {!debouncedQuery && (
          <div className="empty">
            <p>Enter a movie title to search</p>
          </div>
        )}

        {enrichedMovies.length > 0 && (
          <>
            <div className="movies-grid">
              {enrichedMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {hasMore && (
              <div className="load-more">
                <button onClick={loadMore} disabled={loading} className="load-more__btn">
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
