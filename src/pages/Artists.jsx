import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchPeople, fetchPopularPeople, fetchCrewByDepartment, getImageUrl } from '../services/tmdb';
import { useEnrichedPeople } from '../hooks/useEnrichedPeople';
import './Artists.css';

// Map role IDs to TMDB department values
const DEPT_MAP = {
  'all': null,
  'acting': 'Acting',
  'director': 'Directing',
  'asst_director': 'Art',
  'writer': 'Writing',
  'dop': 'Camera',
  'editor': 'Editing',
  'music': 'Sound',
  'producer': 'Production',
  'costume': 'Costume & Make-Up',
  'makeup': 'Costume & Make-Up',
  'stunt': 'Crew',
  'casting': 'Acting',
  'prod_design': 'Art',
  'sound_design': 'Sound',
  'vfx': 'Visual Effects',
  'choreo': 'Crew',
  'lyricist': 'Writing',
  'dubbing': 'Crew',
  'photographer': 'Crew',
};

const ROLE_NAMES = {
  'all': 'All Artists',
  'acting': 'Actors / Actresses',
  'director': 'Directors',
  'asst_director': 'Assistant Directors',
  'writer': 'Writers',
  'dop': 'DOP / Cinematographers',
  'editor': 'Editors',
  'music': 'Music Directors',
  'producer': 'Producers',
  'costume': 'Costume Designers',
  'makeup': 'Makeup Artists',
  'stunt': 'Stunt Coordinators',
  'casting': 'Casting Directors',
  'prod_design': 'Production Designers',
  'sound_design': 'Sound Designers',
  'vfx': 'Visual Effects',
  'choreo': 'Choreographers',
  'lyricist': 'Lyricists',
  'dubbing': 'Dubbing Artists',
  'photographer': 'Still Photographers',
};

const Artists = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'all';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedRole, setSelectedRole] = useState(role);
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedRole(role);
  }, [role]);

  useEffect(() => {
    if (!searched) {
      loadPeople();
    }
  }, [selectedRole, searched]);

  const loadPeople = async () => {
    setLoading(true);
    setSearched(false);

    // For Acting and All, use popular people
    if (selectedRole === 'all' || selectedRole === 'acting') {
      const data = await fetchPopularPeople();
      if (selectedRole === 'acting') {
        const filtered = data.filter(p => p.known_for_department === 'Acting');
        setPopular(filtered.slice(0, 20));
      } else {
        setPopular(data.slice(0, 20));
      }
    } else {
      // For other roles, fetch crew by department
      const dept = DEPT_MAP[selectedRole];
      if (dept) {
        const crew = await fetchCrewByDepartment(dept);
        setPopular(crew);
      } else {
        setPopular([]);
      }
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchPeople(query.trim());
      let filteredResults = data.results || [];

      // Filter by role if not 'all'
      if (selectedRole !== 'all' && DEPT_MAP[selectedRole]) {
        const dept = DEPT_MAP[selectedRole];
        filteredResults = filteredResults.filter(p => p.known_for_department === dept);
      }
      setResults(filteredResults);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const enrichedPopular = useEnrichedPeople(popular);
  const enrichedResults = useEnrichedPeople(results);

  const sectionTitle = ROLE_NAMES[selectedRole] || 'Artists';

  return (
    <div className="artists">
      <section className="artists__hero">
        <div className="artists__hero-content">
          <h1 className="artists__title">{sectionTitle}</h1>
          <p className="artists__subtitle">
            Discover {sectionTitle.toLowerCase()}, directors, writers, and all film industry professionals
          </p>
        </div>
      </section>

      <div className="artists__container">
        <form className="artists__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder={`Search for an actor, director, writer...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="artists__search-input"
          />
          <button type="submit" className="artists__search-btn">
            Search
          </button>
        </form>

        <div className="artists__filter-info">
          <p>Showing: <strong>{sectionTitle}</strong></p>
        </div>

        {loading && (
          <div className="loading">
            <div className="loading__spinner"></div>
            <p>Loading artists...</p>
          </div>
        )}

        {!loading && searched && enrichedResults.length === 0 && (
          <div className="empty">
            No artists found for "{query}". Try a different name.
          </div>
        )}

        {!loading && !searched && enrichedPopular.length === 0 && (
          <div className="empty">
            No popular {sectionTitle.toLowerCase()} found. Try "All Artists" or search by name.
          </div>
        )}

        {!loading && !searched && enrichedPopular.length > 0 && (
          <section className="artists__section">
            <h2 className="artists__section-title">Popular {sectionTitle}</h2>
            <div className="artists__grid">
              {enrichedPopular.map((person) => (
                <div
                  key={person.id}
                  className="artist-card"
                  onClick={() => navigate(`/artist/${person.id}`)}
                >
                  <div className="artist-card__poster">
                    {person.profile_path ? (
                      <img src={getImageUrl(person.profile_path, 'w185')} alt={person.name} />
                    ) : (
                      <div className="artist-card__placeholder">
                        <span className="placeholder-avatar">
                          {person.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="artist-card__info">
                    <h3 className="artist-card__name">{person.name}</h3>
                    <p className="artist-card__known">
                      {person.job || person.known_for_department || 'Artist'}
                    </p>
                    {person.known_for && person.known_for.length > 0 && (
                      <p className="artist-card__movies">
                        Known for: {person.known_for.map(m => m.title || m.name).slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && searched && enrichedResults.length > 0 && (
          <section className="artists__section">
            <h2 className="artists__section-title">
              Search Results ({enrichedResults.length})
            </h2>
            <div className="artists__grid">
              {enrichedResults.map((person) => (
                <div
                  key={person.id}
                  className="artist-card"
                  onClick={() => navigate(`/artist/${person.id}`)}
                >
                  <div className="artist-card__poster">
                    {person.profile_path ? (
                      <img src={getImageUrl(person.profile_path, 'w185')} alt={person.name} />
                    ) : (
                      <div className="artist-card__placeholder">
                        <span className="placeholder-avatar">
                          {person.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="artist-card__info">
                    <h3 className="artist-card__name">{person.name}</h3>
                    <p className="artist-card__known">
                      {person.job || person.known_for_department || 'Artist'}
                    </p>
                    {person.known_for && person.known_for.length > 0 && (
                      <p className="artist-card__movies">
                        Known for: {person.known_for.map(m => m.title || m.name).slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Artists;
