import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '../context/FavoritesContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const LANGUAGES = [
  { code: 'all', name: 'All' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'mr', name: 'Marathi' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'bn', name: 'Bengali' },
  { code: 'or', name: 'Odia' },
  { code: 'bh', name: 'Bhojpuri' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
];

const ARTIST_ROLES = [
  { id: 'all', name: 'All Artists', dept: null },
  { id: 'acting', name: 'Actors / Actresses', dept: 'Acting' },
  { id: 'director', name: 'Director', dept: 'Directing' },
  { id: 'asst_director', name: 'Assistant Director', dept: 'Art' },
  { id: 'writer', name: 'Writers', dept: 'Writing' },
  { id: 'dop', name: 'DOP / Cinematographer', dept: 'Camera' },
  { id: 'editor', name: 'Editors', dept: 'Editing' },
  { id: 'music', name: 'Music Directors', dept: 'Sound' },
  { id: 'producer', name: 'Producers', dept: 'Production' },
  { id: 'costume', name: 'Costume Designers', dept: 'Costume & Make-Up' },
  { id: 'makeup', name: 'Makeup Artists', dept: 'Costume & Make-Up' },
  { id: 'stunt', name: 'Stunt Coordinators', dept: 'Crew' },
  { id: 'casting', name: 'Casting Directors', dept: 'Acting' },
  { id: 'prod_design', name: 'Production Designers', dept: 'Art' },
  { id: 'sound_design', name: 'Sound Designers', dept: 'Sound' },
  { id: 'vfx', name: 'Visual Effects', dept: 'Crew' },
  { id: 'choreo', name: 'Choreographers', dept: 'Crew' },
  { id: 'lyricist', name: 'Lyricists', dept: 'Writing' },
  { id: 'dubbing', name: 'Dubbing Artists', dept: 'Crew' },
  { id: 'photographer', name: 'Still Photographers', dept: 'Crew' },
];

const Navbar = ({ selectedLanguage, onLanguageChange }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'lang' | 'artists' | null
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const navRef = useRef(null);
  const { favorites, watchlist } = useFavorites();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setDrawerOpen(false);
    }
  };

  // Cmd/Ctrl+K or "/" focuses search overlay
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === '/' && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setOpenDropdown(null);
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  // Auto-focus search input when overlay opens
  useEffect(() => {
    if (searchOpen) {
      // Slight delay so the element exists in the DOM
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    return () => {
      setDrawerOpen(false);
      setSearchOpen(false);
    };
  }, []);

  const goHome = () => navigate('/');
  const goReview = () => { navigate('/review'); setDrawerOpen(false); };
  const goHelp = () => { navigate('/help'); setDrawerOpen(false); };
  const goAnalysis = () => { navigate('/analysis'); setDrawerOpen(false); };
  const toggleDropdown = (key) =>
    setOpenDropdown((prev) => (prev === key ? null : key));

  const langName = LANGUAGES.find((l) => l.code === selectedLanguage)?.name || 'All';

  return (
    <>
      <nav className="navbar" ref={navRef} aria-label="Primary navigation">
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo" aria-label="MovieMatch home">
            <Logo size="sm" showWordmark />
          </Link>

          <div className="navbar__nav">
            <button className="nav-btn" onClick={goHome}>Home</button>

            <div className={`nav-dropdown ${openDropdown === 'lang' ? 'is-open' : ''}`}>
              <button
                className="nav-btn"
                aria-haspopup="menu"
                aria-expanded={openDropdown === 'lang'}
                onClick={() => toggleDropdown('lang')}
              >
                <span>{langName}</span>
                <span className="nav-btn__caret" aria-hidden="true">▾</span>
              </button>
              <AnimatePresence>
                {openDropdown === 'lang' && (
                  <motion.div
                    key="lang-menu"
                    role="menu"
                    className="nav-dropdown__content"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        role="menuitem"
                        className={`dropdown-item ${selectedLanguage === lang.code ? 'is-active' : ''}`}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          navigate(lang.code === 'all' ? '/' : `/?lang=${lang.code}`);
                          setOpenDropdown(null);
                        }}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`nav-dropdown ${openDropdown === 'artists' ? 'is-open' : ''}`}>
              <button
                className="nav-btn"
                aria-haspopup="menu"
                aria-expanded={openDropdown === 'artists'}
                onClick={() => toggleDropdown('artists')}
              >
                <span>Artists</span>
                <span className="nav-btn__caret" aria-hidden="true">▾</span>
              </button>
              <AnimatePresence>
                {openDropdown === 'artists' && (
                  <motion.div
                    key="artists-menu"
                    role="menu"
                    className="nav-dropdown__content nav-dropdown__content--wide"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {ARTIST_ROLES.map((role) => (
                      <button
                        key={role.id}
                        role="menuitem"
                        className="dropdown-item"
                        onClick={() => {
                          navigate(`/artists?role=${role.id}`);
                          setOpenDropdown(null);
                        }}
                      >
                        {role.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="nav-btn" onClick={goReview}>Review</button>
            <button className="nav-btn" onClick={goHelp}>Help</button>
            <button className="nav-btn" onClick={goAnalysis}>Analysis</button>
          </div>

          <div className="navbar__actions">
            <button
              className="navbar__icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              title="Search (⌘K)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </button>

            <Link
              to="/favorites"
              className="navbar__icon-btn navbar__icon-btn--badge"
              aria-label={`Favorites (${favorites.length})`}
              title="My favorites"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {favorites.length > 0 && (
                <span className="navbar__icon-badge" aria-hidden="true">{favorites.length}</span>
              )}
            </Link>

            <ThemeToggle size="sm" />

            <button
              className="navbar__hamburger"
              onClick={() => setDrawerOpen((d) => !d)}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
            >
              <span className={`navbar__hamburger-bar ${drawerOpen ? 'is-open' : ''}`} />
              <span className={`navbar__hamburger-bar ${drawerOpen ? 'is-open' : ''}`} />
              <span className={`navbar__hamburger-bar ${drawerOpen ? 'is-open' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-overlay"
            className="navbar__search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSearchOpen(false);
            }}
          >
            <motion.div
              className="navbar__search-panel"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <form className="navbar__search-form" onSubmit={handleSearch}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search movies, actors, directors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="navbar__search-input"
                  aria-label="Search movies"
                />
                <kbd className="navbar__search-kbd" aria-hidden="true">Esc</kbd>
              </form>
              <div className="navbar__search-hint">
                Press <kbd>Enter</kbd> to search · <kbd>Esc</kbd> to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="drawer-backdrop"
              className="navbar__drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              key="drawer"
              className="navbar__drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="navbar__drawer-header">
                <span className="text-display">Menu</span>
                <button className="navbar__icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="navbar__drawer-section">
                <p className="navbar__drawer-label">Browse</p>
                <button className="navbar__drawer-link" onClick={goHome}>Home</button>
                <button className="navbar__drawer-link" onClick={goReview}>Review</button>
                <button className="navbar__drawer-link" onClick={goHelp}>Help</button>
                <button className="navbar__drawer-link" onClick={goAnalysis}>Analysis</button>
              </div>
              <div className="navbar__drawer-section">
                <p className="navbar__drawer-label">Languages</p>
                <div className="navbar__drawer-chips">
                  {LANGUAGES.slice(0, 8).map((lang) => (
                    <button
                      key={lang.code}
                      className={`navbar__drawer-chip ${selectedLanguage === lang.code ? 'is-active' : ''}`}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        navigate(lang.code === 'all' ? '/' : `/?lang=${lang.code}`);
                        setDrawerOpen(false);
                      }}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="navbar__drawer-section">
                <p className="navbar__drawer-label">Artists</p>
                <div className="navbar__drawer-chips">
                  {ARTIST_ROLES.slice(0, 6).map((role) => (
                    <button
                      key={role.id}
                      className="navbar__drawer-chip"
                      onClick={() => {
                        navigate(`/artists?role=${role.id}`);
                        setDrawerOpen(false);
                      }}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="navbar__drawer-section">
                <p className="navbar__drawer-label">Appearance</p>
                <ThemeToggle size="lg" />
              </div>
              <div className="navbar__drawer-footer">
                <div className="navbar__drawer-stat">
                  <span className="navbar__drawer-stat-num text-mono-num">{favorites.length}</span>
                  <span className="navbar__drawer-stat-label">Favorites</span>
                </div>
                <div className="navbar__drawer-stat">
                  <span className="navbar__drawer-stat-num text-mono-num">{watchlist.length}</span>
                  <span className="navbar__drawer-stat-label">Watchlist</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;