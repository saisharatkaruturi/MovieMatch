import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchPersonDetails, getImageUrl } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import SectionHeader from '../components/SectionHeader';
import { MotionSection } from '../components/MotionSection';
import { useEnrichedMovies } from '../hooks/useEnrichedMovies';
import { useEnrichedPeople } from '../hooks/useEnrichedPeople';
import './ArtistDetails.css';

// TMDB gender codes: 0 = not set, 1 = female, 2 = male, 3 = non-binary.
const GENDER_LABEL = {
  0: 'Prefer not to say',
  1: 'Female',
  2: 'Male',
  3: 'Non-binary',
};

const BIO_COLLAPSE_AT = 360;

const calculateAge = (birthday, deathday) => {
  if (!birthday) return null;
  const end = deathday ? new Date(deathday) : new Date();
  const start = new Date(birthday);
  let age = end.getFullYear() - start.getFullYear();
  const m = end.getMonth() - start.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < start.getDate())) age--;
  return age;
};

const formatDate = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
};

const ArtistDetails = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('movie');
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    const loadPerson = async () => {
      try {
        setLoading(true);
        setError(null);
        setBioExpanded(false);
        const data = await fetchPersonDetails(id);
        if (data) {
          setPerson(data);
        } else {
          setError('Artist not found');
        }
      } catch {
        setError('Failed to load artist details');
      } finally {
        setLoading(false);
      }
    };

    loadPerson();
  }, [id]);

  const enrichedPerson = useEnrichedPeople(person ? [person] : []);
  const detailPerson = enrichedPerson[0] || person;

  const movieCredits = useEnrichedMovies(person?.movie_credits?.cast || []);
  const crewCredits = useEnrichedMovies(person?.movie_credits?.crew || []);
  const tvCredits = useEnrichedMovies(person?.tv_credits?.cast || []);

  const stats = useMemo(() => {
    if (!person) return null;
    const totalRoles =
      (person.movie_credits?.cast?.length || 0)
      + (person.tv_credits?.cast?.length || 0)
      + (person.movie_credits?.crew?.length || 0);
    const uniqueJobs = new Set(
      (person.movie_credits?.crew || []).map((c) => c.job).filter(Boolean),
    ).size;
    return { totalRoles, uniqueJobs };
  }, [person]);

  if (loading) {
    return (
      <div className="artist-details artist-details--loading">
        <div className="artist-details__hero-skel" aria-hidden="true" />
        <div className="artist-details__container">
          <div className="artist-details__skel-grid">
            <div className="artist-details__skel-photo" />
            <div className="artist-details__skel-info">
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

  if (error || !detailPerson) {
    return (
      <div className="artist-details">
        <div className="artist-details__error">
          <span aria-hidden="true">⚠</span>
          <h3>{error || 'Artist not found'}</h3>
          <Link to="/artists" className="movie-details__back">← Back to Artists</Link>
        </div>
      </div>
    );
  }

  // Group crew credits by job for the Crew tab.
  const crewByJob = {};
  crewCredits.forEach((credit) => {
    if (!credit.job) return;
    if (!crewByJob[credit.job]) crewByJob[credit.job] = [];
    crewByJob[credit.job].push(credit);
  });
  const jobs = Object.keys(crewByJob).slice(0, 12);

  const heroBackdrop = detailPerson.profile_path
    ? getImageUrl(detailPerson.profile_path, 'w1280')
    : null;
  const heroPhoto = detailPerson.profile_path
    ? getImageUrl(detailPerson.profile_path, 'h632')
    : null;
  const age = calculateAge(detailPerson.birthday, detailPerson.deathday);
  const gender = GENDER_LABEL[detailPerson.gender] ?? null;
  const biography = detailPerson.biography || '';
  const bioNeedsTruncation = biography.length > BIO_COLLAPSE_AT;

  return (
    <div className="artist-details">
      {/* === Hero backdrop (blurred profile photo as background) === */}
      <div className="artist-details__hero" aria-hidden="true">
        {heroBackdrop && (
          <div
            className="artist-details__hero-img"
            style={{ backgroundImage: `url(${heroBackdrop})` }}
          />
        )}
        <div className="artist-details__hero-mask" />
        <div className="artist-details__hero-glow artist-details__hero-glow--cyan" />
        <div className="artist-details__hero-glow artist-details__hero-glow--violet" />
      </div>

      <div className="artist-details__container">
        <Link to="/artists" className="movie-details__back-link">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to Artists</span>
        </Link>

        {/* === Top section: photo + identity === */}
        <div className="artist-details__top">
          <motion.div
            className="artist-details__photo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {heroPhoto ? (
              <img src={heroPhoto} alt={detailPerson.name} loading="lazy" />
            ) : (
              <div className="artist-details__placeholder">
                <span>
                  {detailPerson.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
            )}
          </motion.div>

          <motion.div
            className="artist-details__info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {detailPerson.known_for_department && (
              <span className="artist-details__dept text-mono-num">
                {detailPerson.known_for_department}
              </span>
            )}
            <h1 className="artist-details__name text-display">{detailPerson.name}</h1>

            <div className="artist-details__facts">
              {detailPerson.birthday && (
                <div className="fact">
                  <span className="fact__label">Born</span>
                  <span className="fact__value">
                    {formatDate(detailPerson.birthday)}
                    {age !== null && (
                      <span className="fact__suffix">
                        {detailPerson.deathday ? '' : ` (age ${age})`}
                      </span>
                    )}
                    {detailPerson.deathday && (
                      <span className="fact__suffix">
                        {' '}— {formatDate(detailPerson.deathday)}
                        {age !== null && ` (age ${age})`}
                      </span>
                    )}
                  </span>
                </div>
              )}
              {detailPerson.place_of_birth && (
                <div className="fact">
                  <span className="fact__label">From</span>
                  <span className="fact__value">{detailPerson.place_of_birth}</span>
                </div>
              )}
              {gender && (
                <div className="fact">
                  <span className="fact__label">Gender</span>
                  <span className="fact__value">{gender}</span>
                </div>
              )}
              {detailPerson.popularity ? (
                <div className="fact">
                  <span className="fact__label">Popularity</span>
                  <span className="fact__value text-mono-num">
                    {detailPerson.popularity.toFixed(1)}
                  </span>
                </div>
              ) : null}
            </div>

            {detailPerson.also_known_as?.length > 0 && (
              <p className="artist-details__aka">
                <span className="aka-label">Also Known As</span>
                {detailPerson.also_known_as.slice(0, 3).join(' · ')}
              </p>
            )}

            {stats && (
              <div className="artist-details__stats">
                <div className="stat-card">
                  <span className="stat-card__num text-mono-num">{movieCredits.length}</span>
                  <span className="stat-card__label">Acting roles</span>
                </div>
                <div className="stat-card">
                  <span className="stat-card__num text-mono-num">{stats.uniqueJobs}</span>
                  <span className="stat-card__label">Crew roles</span>
                </div>
                <div className="stat-card">
                  <span className="stat-card__num text-mono-num">{tvCredits.length}</span>
                  <span className="stat-card__label">TV shows</span>
                </div>
                <div className="stat-card">
                  <span className="stat-card__num text-mono-num">{stats.totalRoles}</span>
                  <span className="stat-card__label">Total credits</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* === Biography === */}
        {biography && (
          <MotionSection className="artist-details__section">
            <SectionHeader icon="📖" title="Biography" />
            <p
              className={`artist-details__bio ${bioExpanded ? 'is-expanded' : ''}`}
            >
              {biography}
            </p>
            {bioNeedsTruncation && (
              <button
                type="button"
                className="movie-details__readmore"
                onClick={() => setBioExpanded((s) => !s)}
              >
                {bioExpanded ? 'Show less' : 'Read more'}
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d={bioExpanded ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </MotionSection>
        )}

        {/* === Tabs === */}
        <MotionSection className="artist-details__section">
          <div className="artist-details__tabs" role="tablist" aria-label="Filmography">
            {[
              { key: 'movie', label: 'Acting', count: movieCredits.length, icon: '🎬' },
              { key: 'crew', label: 'Crew', count: crewCredits.length, icon: '🛠' },
              { key: 'tv', label: 'TV', count: tvCredits.length, icon: '📺' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="tab-btn__icon" aria-hidden="true">{tab.icon}</span>
                <span className="tab-btn__label">{tab.label}</span>
                <span className="tab-btn__count text-mono-num">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* === Tab content === */}
          <div className="artist-details__content">
            {activeTab === 'movie' && (
              <div className="credits-section">
                {movieCredits.length === 0 ? (
                  <div className="artist-details__empty">
                    <span aria-hidden="true">🎬</span>
                    <p>No acting credits found.</p>
                  </div>
                ) : (
                  <>
                    <SectionHeader
                      icon="🎭"
                      title="Acting Filmography"
                      meta={`${movieCredits.length} films`}
                    />
                    <div className="movies-grid">
                      {movieCredits.map((movie) => (
                        <MovieCard
                          key={`${movie.id}-${movie.character || ''}`}
                          movie={movie}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'crew' && (
              <div className="credits-section">
                {jobs.length === 0 ? (
                  <div className="artist-details__empty">
                    <span aria-hidden="true">🛠</span>
                    <p>No crew credits found.</p>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div key={job} className="crew-job-section">
                      <SectionHeader
                        icon="🛠"
                        title={job}
                        meta={`${crewByJob[job].length} titles`}
                      />
                      <div className="movies-grid">
                        {crewByJob[job].slice(0, 12).map((movie) => (
                          <MovieCard key={`${movie.id}-${job}`} movie={movie} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'tv' && (
              <div className="credits-section">
                {tvCredits.length === 0 ? (
                  <div className="artist-details__empty">
                    <span aria-hidden="true">📺</span>
                    <p>No TV credits found.</p>
                  </div>
                ) : (
                  <>
                    <SectionHeader
                      icon="📺"
                      title="TV Series"
                      meta={`${tvCredits.length} shows`}
                    />
                    <div className="movies-grid">
                      {tvCredits.map((show) => (
                        <div key={`${show.id}-${show.character || ''}`} className="tv-card">
                          <div className="tv-card__poster">
                            {show.poster_path ? (
                              <img
                                src={getImageUrl(show.poster_path, 'w342')}
                                alt={show.name}
                                loading="lazy"
                              />
                            ) : (
                              <div className="tv-card__placeholder">📺</div>
                            )}
                          </div>
                          <div className="tv-card__info">
                            <h4 className="tv-card__title">{show.name}</h4>
                            {show.character && (
                              <p className="tv-card__character">as {show.character}</p>
                            )}
                            <p className="tv-card__date text-mono-num">
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
        </MotionSection>
      </div>
    </div>
  );
};

export default ArtistDetails;