import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import { GenreProvider } from './context/GenreContext';
import Home from './pages/Home';
import Search from './pages/Search';
import MovieDetails from './pages/MovieDetails';
import Review from './pages/Review';
import Help from './pages/Help';
import Analysis from './pages/Analysis';
import Artists from './pages/Artists';
import ArtistDetails from './pages/ArtistDetails';
import './App.css';

function AppContent() {
  const [searchParams] = useSearchParams();
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lang = searchParams.get('lang');
    if (lang) {
      setSelectedLanguage(lang);
    } else {
      setSelectedLanguage('all');
    }
  }, [searchParams]);

  return (
    <GenreProvider>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      <div className="app" style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        <Navbar
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <main>
          <Routes>
            <Route path="/" element={<Home selectedLanguage={selectedLanguage} />} />
            <Route path="/search" element={<Search />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/review" element={<Review />} />
            <Route path="/help" element={<Help />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artist/:id" element={<ArtistDetails />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>MovieMatch - World Cinema from 1900-2025</p>
        </footer>
      </div>
    </GenreProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
