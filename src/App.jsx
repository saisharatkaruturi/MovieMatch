import { BrowserRouter as Router, Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import Logo from './components/Logo';
import Toast from './components/Toast';
import { GenreProvider } from './context/GenreContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Search from './pages/Search';
import MovieDetails from './pages/MovieDetails';
import Review from './pages/Review';
import Help from './pages/Help';
import Analysis from './pages/Analysis';
import Artists from './pages/Artists';
import ArtistDetails from './pages/ArtistDetails';
import Favorites from './pages/Favorites';
import './App.css';

function AppContent() {
  const [searchParams] = useSearchParams();
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const lang = searchParams.get('lang');
    setSelectedLanguage(lang || 'all');
  }, [searchParams]);

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      <div
        className="app"
        style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease' }}
      >
        <Navbar
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <main>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <Routes location={location}>
                <Route path="/" element={<Home selectedLanguage={selectedLanguage} />} />
                <Route path="/search" element={<Search />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/review" element={<Review />} />
                <Route path="/help" element={<Help />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/artists" element={<Artists />} />
                <Route path="/artist/:id" element={<ArtistDetails />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      <Toast />
    </>
  );
}

const Footer = () => (
  <footer className="footer">
    <div className="footer__top-accent" aria-hidden="true" />
    <div className="footer__inner">
      <div className="footer__brand">
        <Logo size="md" showWordmark={false} />
        <div>
          <p className="footer__brand-name text-display">MovieMatch</p>
          <p className="footer__brand-tag">Cinematic world cinema, curated for you.</p>
        </div>
      </div>
      <div className="footer__columns">
        <div className="footer__col">
          <h4 className="footer__col-title">Discover</h4>
          <a href="/" className="footer__link">Home</a>
          <a href="/search?q=trending" className="footer__link">Trending</a>
          <a href="/analysis" className="footer__link">Analysis</a>
          <a href="/artists" className="footer__link">Artists</a>
        </div>
        <div className="footer__col">
          <h4 className="footer__col-title">Account</h4>
          <a href="/review" className="footer__link">Reviews</a>
          <a href="/help" className="footer__link">Help &amp; FAQ</a>
          <a href="/favorites" className="footer__link">My Favorites</a>
        </div>
        <div className="footer__col">
          <h4 className="footer__col-title">Stack</h4>
          <span className="footer__link footer__link--muted">Powered by TMDB</span>
          <span className="footer__link footer__link--muted">React 19 · Vite</span>
          <span className="footer__link footer__link--muted">Inter &amp; Fraunces</span>
        </div>
      </div>
    </div>
    <div className="footer__bottom">
      <p>MovieMatch — Cinematic World Cinema, 1900–2026.</p>
      <p className="footer__bottom-meta">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
    </div>
  </footer>
);

const NotFound = () => (
  <div className="notfound">
    <h1 className="text-display notfound__title gradient-text">404</h1>
    <p className="notfound__msg">That reel got lost in the archives.</p>
    <a href="/" className="notfound__link">← Back to home</a>
  </div>
);

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <FavoritesProvider>
            <GenreProvider>
              <AppContent />
            </GenreProvider>
          </FavoritesProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;