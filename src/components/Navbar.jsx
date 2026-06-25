import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          <img src="/logo.svg" alt="MovieMatch" className="navbar__logo-img" />
          <span className="navbar__logo-text">MovieMatch</span>
        </Link>

        <div className="navbar__nav">
          <Link to="/" className="nav-btn">Home</Link>
          <div className="nav-dropdown">
            <button className="nav-btn">Language ▾</button>
            <div className="nav-dropdown-content">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`dropdown-item ${selectedLanguage === lang.code ? 'active' : ''}`}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    if (lang.code !== 'all') {
                      navigate(`/?lang=${lang.code}`);
                    } else {
                      navigate('/');
                    }
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
          <div className="nav-dropdown">
            <button className="nav-btn">Artists ▾</button>
            <div className="nav-dropdown-content artists-dropdown">
              {ARTIST_ROLES.map((role) => (
                <button
                  key={role.id}
                  className="dropdown-item"
                  onClick={() => navigate(`/artists?role=${role.id}`)}
                >
                  {role.name}
                </button>
              ))}
            </div>
          </div>
          <button className="nav-btn" onClick={() => navigate('/review')}>Review</button>
          <button className="nav-btn" onClick={() => navigate('/help')}>Help</button>
          <button className="nav-btn" onClick={() => navigate('/analysis')}>Analysis</button>
        </div>

        <form className="navbar__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="navbar__search-input"
          />
          <button type="submit" className="navbar__search-btn">
            🔍
          </button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
