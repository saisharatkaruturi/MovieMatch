import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPersonDetails, getImageUrl } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { useEnrichedMovies } from '../hooks/useEnrichedMovies';
import { useEnrichedPeople } from '../hooks/useEnrichedPeople';
import './ArtistDetails.css';

const ArtistDetails = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('movie');

  useEffect(() => {
    const loadPerson = async () => {
      try {
        setLoading(true);
        const data = await fetchPersonDetails(id);
        if (data) {
          setPerson(data);
        } else {
          setError('Artist not found');
        }
      } catch (err) {
        setError('Failed to load artist details');
      } finally {
        setLoading(false);
      }
    };

    loadPerson();
  }, [id]);

  const enrichedPerson = useEnrichedPeople(person ? [person] : []);
  const detailPerson = enrichedPerson[0] || person;
  const movieCreditsArr = person?.movie_credits?.cast || [];
  const crewCreditsArr = person?.movie_credits?.crew || [];
  const tvCreditsArr = person?.tv_credits?.cast || [];
  const enrichedMovieCredits = useEnrichedMovies(movieCreditsArr);
  const enrichedCrewCredits = useEnrichedMovies(crewCreditsArr);
  const enrichedTvCredits = useEnrichedMovies(tvCreditsArr);

  if (loading) {
    return (
      <div className="artist-details">
        <div className="loading">
          <div className="loading__spinner"></div>
          <p>Loading artist...</p>
        </div>
      </div>
    );
  }

  if (error || !detailPerson) {
    return (
      <div className="artist-details">
        <div className="error">{error || 'Artist not found'}</div>
        <Link to="/artists" className="back-link">← Back to Artists</Link>
      </div>
    );
  }

  const movieCredits = enrichedMovieCredits;
  const crewCredits = enrichedCrewCredits;
  const tvCredits = enrichedTvCredits;

  // Group crew by job
  const crewByJob = {};
  crewCredits.forEach((credit) => {
    if (!crewByJob[credit.job]) {
      crewByJob[credit.job] = [];
    }
    crewByJob[credit.job].push(credit);
  });

  // Get unique jobs
  const uniqueJobs = [...new Set(crewCredits.map(c => c.job))].slice(0, 15);

  return (
    <div className="artist-details">
      <div
        className="artist-details__backdrop"
        style={{
          backgroundImage: detailPerson.profile_path
            ? `url(${getImageUrl(detailPerson.profile_path, 'w1280')})`
            : 'none'
        }}
      >
        <div className="artist-details__backdrop-overlay"></div>
      </div>

      <div className="artist-details__container">
        <Link to="/artists" className="back-link">← Back to Artists</Link>

        <div className="artist-details__main">
          <div className="artist-details__poster">
            {detailPerson.profile_path ? (
              <img src={getImageUrl(detailPerson.profile_path, 'h632')} alt={detailPerson.name} />
            ) : (
              <div className="artist-details__placeholder">
                <span className="placeholder-avatar">
                  {detailPerson.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="artist-details__info">
            <h1 className="artist-details__name">{detailPerson.name}</h1>

            {detailPerson.known_for_department && (
              <p className="artist-details__department">{detailPerson.known_for_department}</p>
            )}

            {detailPerson.birthday && (
              <p className="artist-details__bio">
                <strong>Born:</strong> {detailPerson.birthday}
                {detailPerson.death_date && ` - ${detailPerson.death_date}`}
                {detailPerson.place_of_birth && ` in ${detailPerson.place_of_birth}`}
              </p>
            )}

            {detailPerson.gender === 1 && (
              <p className="artist-details__gender">Female</p>
            )}

            {detailPerson.also_known_as && detailPerson.also_known_as.length > 0 && (
              <p className="artist-details__aka">
                <strong>Also Known As:</strong> {detailPerson.also_known_as.slice(0, 3).join(', ')}
              </p>
            )}

            {detailPerson.biography && (
              <div className="artist-details__biography">
                <h3>Biography</h3>
                <p className="artist-details__bio-text">
                  {detailPerson.biography.length > 1000
                    ? detailPerson.biography.substring(0, 1000) + '...'
                    : detailPerson.biography}
                </p>
              </div>
            )}

            <div className="artist-details__stats">
              <div className="stat">
                <span className="stat__number">{movieCredits.length}</span>
                <span className="stat__label">Movies</span>
              </div>
              <div className="stat">
                <span className="stat__number">{uniqueJobs.length}</span>
                <span className="stat__label">Crew Roles</span>
              </div>
              <div className="stat">
                <span className="stat__number">{tvCredits.length}</span>
                <span className="stat__label">TV Shows</span>
              </div>
            </div>
          </div>
        </div>

        <div className="artist-details__tabs">
          <button
            className={`tab-btn ${activeTab === 'movie' ? 'active' : ''}`}
            onClick={() => setActiveTab('movie')}
          >
            Acting ({movieCredits.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'crew' ? 'active' : ''}`}
            onClick={() => setActiveTab('crew')}
          >
            Crew ({crewCredits.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'tv' ? 'active' : ''}`}
            onClick={() => setActiveTab('tv')}
          >
            TV ({tvCredits.length})
          </button>
        </div>

        <div className="artist-details__content">
          {activeTab === 'movie' && (
            <div className="credits-section">
              {movieCredits.length === 0 ? (
                <p className="no-credits">No acting credits found.</p>
              ) : (
                <>
                  <h3 className="credits-title">Filmography (Acting)</h3>
                  <div className="movies-grid">
                    {movieCredits.map((movie) => (
                      <MovieCard key={`${movie.id}-${movie.character}`} movie={movie} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'crew' && (
            <div className="credits-section">
              {crewCredits.length === 0 ? (
                <p className="no-credits">No crew credits found.</p>
              ) : (
                <>
                  {uniqueJobs.map((job) => (
                    <div key={job} className="crew-job-section">
                      <h3 className="credits-title">{job}</h3>
                      <div className="movies-grid">
                        {crewByJob[job].slice(0, 12).map((movie) => (
                          <MovieCard key={`${movie.id}-${job}`} movie={movie} />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'tv' && (
            <div className="credits-section">
              {tvCredits.length === 0 ? (
                <p className="no-credits">No TV credits found.</p>
              ) : (
                <>
                  <h3 className="credits-title">TV Series</h3>
                  <div className="movies-grid">
                    {tvCredits.map((show) => (
                      <div key={`${show.id}-${show.character}`} className="tv-card">
                        <div className="tv-card__poster">
                          {show.poster_path ? (
                            <img src={getImageUrl(show.poster_path)} alt={show.name} />
                          ) : (
                            <div className="tv-card__placeholder">📺</div>
                          )}
                        </div>
                        <div className="tv-card__info">
                          <h4 className="tv-card__title">{show.name}</h4>
                          {show.character && (
                            <p className="tv-card__character">as {show.character}</p>
                          )}
                          <p className="tv-card__date">
                            {show.first_air_date?.split('-')[0] || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetails;
