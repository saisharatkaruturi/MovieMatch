import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  searchPeople,
  fetchPopularPeople,
  fetchCrewByDepartment,
  getImageUrl,
} from '../services/tmdb';
import { useEnrichedPeople } from '../hooks/useEnrichedPeople';
import SectionHeader from '../components/SectionHeader';
import { MotionSection } from '../components/MotionSection';
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

// Compact role list for the tab pills.
const QUICK_ROLES = ['all', 'acting', 'director', 'writer', 'dop', 'editor', 'music', 'producer', 'vfx'];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, searched]);

  const loadPeople = useCallback(async () => {
    setLoading(true);
    setSearched(false);

    if (selectedRole === 'all' || selectedRole === 'acting') {
      const data = await fetchPopularPeople();
      if (selectedRole === 'acting') {
        const filtered = data.filter((p) => p.known_for_department === 'Acting');
        setPopular(filtered.slice(0, 20));
      } else {
        setPopular(data.slice(0, 20));
      }
    } else {
      const dept = DEPT_MAP[selectedRole];
      if (dept) {
        const crew = await fetchCrewByDepartment(dept);
        setPopular(crew);
      } else {
        setPopular([]);
      }
    }
    setLoading(false);
  }, [selectedRole]);

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchPeople(query.trim());
      let filteredResults = data.results || [];

      if (selectedRole !== 'all' && DEPT_MAP[selectedRole]) {
        const dept = DEPT_MAP[selectedRole];
        filteredResults = filteredResults.filter((p) => p.known_for_department === dept);
      }
      setResults(filteredResults);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (next) => {
    setSelectedRole(next);
    setSearched(false);
    if (next === 'all') {
      navigate('/artists');
    } else {
      navigate(`/artists?role=${next}`);
    }
  };

  const enrichedPopular = useEnrichedPeople(popular);
  const enrichedResults = useEnrichedPeople(results);

  const sectionTitle = ROLE_NAMES[selectedRole] || 'Artists';

  const PersonCard = ({ person }) => (
    <motion.button
      type="button"
      className="artist-card"
      onClick={() => navigate(`/artist/${person.id}`)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <div className="artist-card__photo">
        {person.profile_path ? (
          <img
            src={getImageUrl(person.profile_path, 'w342')}
            alt={person.name}
            loading="lazy"
          />
        ) : (
          <div className="artist-card__placeholder">
            <span>
              {person.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
        )}
        <div className="artist-card__dept-badge">
          {person.job || person.known_for_department || 'Artist'}
        </div>
      </div>
      <div className="artist-card__info">
        <h3 className="artist-card__name">{person.name}</h3>
        <p className="artist-card__known text-mono-num">
          {person.popularity ? `★ ${person.popularity.toFixed(1)}` : ''}
          {(person.known_for?.length || 0) > 0 ? (
            <>
              {person.popularity ? ' · ' : ''}
              <span className="artist-card__known-text">
                Known for {person.known_for
                  .slice(0, 2)
                  .map((m) => m.title || m.name)
                  .join(', ')}
              </span>
            </>
          ) : null}
        </p>
      </div>
    </motion.button>
  );

  return (
    <div className="artists">
      {/* === Cinematic hero === */}
      <section className="artists__hero">
        <div className="artists__hero-bg" aria-hidden="true">
          <div className="artists__hero-glow artists__hero-glow--cyan" />
          <div className="artists__hero-glow artists__hero-glow--violet" />
        </div>
        <div className="artists__hero-inner">
          <motion.span
            className="artists__kicker"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="artists__kicker-dot" />
            The talent behind the lens
          </motion.span>
          <motion.h1
            className="artists__title text-display"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            {sectionTitle}
          </motion.h1>
          <motion.p
            className="artists__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            Discover actors, directors, writers, and the film industry professionals behind the work.
          </motion.p>
        </div>
      </section>

      <div className="artists__container">
        {/* === Search bar === */}
        <motion.form
          className="artists__search"
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            className="artists__search-icon"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder={`Search ${sectionTitle.toLowerCase()}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="artists__search-input"
            aria-label="Search artists"
          />
          <button type="submit" className="artists__search-btn" disabled={!query.trim()}>
            Search
          </button>
        </motion.form>

        {/* === Role tabs === */}
        <div className="artists__roles" role="tablist" aria-label="Artist role">
          {QUICK_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={selectedRole === r}
              className={`role-chip ${selectedRole === r ? 'is-active' : ''}`}
              onClick={() => switchRole(r)}
            >
              {ROLE_NAMES[r] || r}
            </button>
          ))}
        </div>

        {/* === Loading state === */}
        {loading && (
          <div className="artists__loading">
            <div className="artists__spinner" aria-hidden="true" />
            <p>Loading {sectionTitle.toLowerCase()}…</p>
          </div>
        )}

        {/* === Empty search === */}
        <AnimatePresence mode="wait">
          {!loading && searched && enrichedResults.length === 0 && (
            <motion.div
              key="empty-search"
              className="artists__empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="artists__empty-icon" aria-hidden="true">🔍</span>
              <h3 className="text-display">No results for "{query}"</h3>
              <p>Try a different name, or switch to <strong>All Artists</strong>.</p>
            </motion.div>
          )}

          {!loading && !searched && enrichedPopular.length === 0 && (
            <motion.div
              key="empty-popular"
              className="artists__empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="artists__empty-icon" aria-hidden="true">🎭</span>
              <h3 className="text-display">No popular {sectionTitle.toLowerCase()} yet</h3>
              <p>Try "All Artists" or search by name above.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Popular list === */}
        {!loading && !searched && enrichedPopular.length > 0 && (
          <MotionSection className="artists__section">
            <SectionHeader
              icon="⭐"
              title={`Popular ${sectionTitle}`}
              meta={`${enrichedPopular.length} profiles`}
            />
            <div className="artists__grid">
              {enrichedPopular.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          </MotionSection>
        )}

        {/* === Search results === */}
        {!loading && searched && enrichedResults.length > 0 && (
          <MotionSection className="artists__section">
            <SectionHeader
              icon="✨"
              title={`Search Results`}
              kicker={`Matching "${query}" in ${sectionTitle.toLowerCase()}`}
              meta={`${enrichedResults.length} profiles`}
            />
            <div className="artists__grid">
              {enrichedResults.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          </MotionSection>
        )}
      </div>
    </div>
  );
};

export default Artists;