import { useState } from 'react';
import './Review.css';

const REVIEWS_DATA = [
  {
    id: 1,
    movieTitle: 'Baahubali: The Beginning',
    movieId: 1,
    lang: 'Telugu',
    rating: 5,
    author: 'MovieEnthusiast',
    date: '2024-01-15',
    title: 'Epic Masterpiece!',
    text: 'An absolute visual spectacle! The storytelling, action sequences, and emotional depth are unmatched. SS Rajamouli proves why he is the king of Indian cinema. The cliffhanger ending still haunts me!',
    likes: 245,
    source: 'User Review'
  },
  {
    id: 2,
    movieTitle: 'The Godfather',
    movieId: 28,
    lang: 'English',
    rating: 5,
    author: 'Cinephile',
    date: '2024-02-20',
    title: 'Timeless Classic',
    text: 'Francis Ford Coppola created a masterpiece that defines the gangster genre. Marlon Brando\'s Vito Corleone is legendary. Every frame is perfection.',
    likes: 189,
    source: 'User Review'
  },
  {
    id: 3,
    movieTitle: 'Parasite',
    movieId: 44,
    lang: 'Korean',
    rating: 5,
    author: 'FilmFan2024',
    date: '2024-03-10',
    title: 'Brilliantly Crafted',
    text: 'Bong Joon-ho proves that cinema has no language barriers. A perfect blend of dark comedy, thriller, and social commentary. The plot twists left me speechless!',
    likes: 312,
    source: 'User Review'
  },
  {
    id: 4,
    movieTitle: 'Spirited Away',
    movieId: 50,
    lang: 'Japanese',
    rating: 4,
    author: 'AnimationLover',
    date: '2024-01-28',
    title: 'Beautiful but Slow',
    text: 'The animation is gorgeous and the world-building is creative. However, the pacing felt dragging in the middle. Younger viewers might lose interest. Still a solid 4 stars.',
    likes: 87,
    source: 'User Review'
  },
  {
    id: 5,
    movieTitle: 'Dangal',
    movieId: 10,
    lang: 'Hindi',
    rating: 5,
    author: 'SportsFan',
    date: '2024-02-05',
    title: 'Great but Overlong',
    text: 'Aamir Khan delivers an Oscar-worthy performance. The emotional journey of a father training his daughters for wrestling glory is incredibly moving. Could have been trimmed by 20 minutes though.',
    likes: 156,
    source: 'User Review'
  },
  {
    id: 6,
    movieTitle: 'The Dark Knight',
    movieId: 30,
    lang: 'English',
    rating: 5,
    author: 'SuperheroFan',
    date: '2024-03-01',
    title: 'Batman at His Best',
    text: 'Christopher Nolan redefined superhero movies. Heath Ledger\'s Joker is the greatest villain performance in cinema history. Intense and gripping!',
    likes: 423,
    source: 'User Review'
  },
  {
    id: 7,
    movieTitle: '3 Idiots',
    movieId: 12,
    lang: 'Hindi',
    rating: 5,
    author: 'EducationReformer',
    date: '2024-02-12',
    title: 'Must Watch for Students',
    text: 'This film questions the Indian education system while being thoroughly entertaining. "All is well" became a mantra for a generation!',
    likes: 567,
    source: 'User Review'
  },
  {
    id: 8,
    movieTitle: 'RRR',
    movieId: 3,
    lang: 'Telugu',
    rating: 5,
    author: 'ActionLover',
    date: '2024-01-20',
    title: 'Mass Entertainer',
    text: 'SS Rajamouli does it again! The interval block and "Naatu Naatu" dance are legendary. A perfect mix of action, drama, and friendship.',
    likes: 489,
    source: 'User Review'
  },
  {
    id: 9,
    movieTitle: 'Amélie',
    movieId: 61,
    lang: 'French',
    rating: 4,
    author: 'RomanticSoul',
    date: '2024-02-25',
    title: 'Charming but Pretentious',
    text: 'A whimsical journey through Paris with a lovable protagonist. Beautiful cinematography but the plot felt thin at times. Nice feel-good vibes though.',
    likes: 98,
    source: 'User Review'
  },
  {
    id: 10,
    movieTitle: 'Oldboy',
    movieId: 45,
    lang: 'Korean',
    rating: 5,
    author: 'ThrillerSeeker',
    date: '2024-03-05',
    title: 'Mind-Bending Revenge',
    text: 'The iconic corridor fight scene took my breath away. Park Chan-wook crafts a revenge thriller like no other. The twist destroyed me!',
    likes: 223,
    source: 'User Review'
  },
  {
    id: 11,
    movieTitle: 'City of God',
    movieId: 76,
    lang: 'Portuguese',
    rating: 5,
    author: 'WorldCinemaFan',
    date: '2024-03-15',
    title: 'Raw and Powerful',
    text: 'A harrowing look at life in the favelas of Rio. The filmmaking technique and performances are extraordinary. A difficult but essential watch.',
    likes: 134,
    source: 'User Review'
  }
];

// Critic scores from various sources (mock data - in production, use actual APIs)
const CRITIC_SCORES = {
  'Baahubali: The Beginning': { imdb: 8.3, rt: 87, mc: 72 },
  'The Godfather': { imdb: 9.2, rt: 97, mc: 100 },
  'Parasite': { imdb: 8.5, rt: 99, mc: 96 },
  'Spirited Away': { imdb: 8.6, rt: 97, mc: 96 },
  'Dangal': { imdb: 8.4, rt: 95, mc: 89 },
  'The Dark Knight': { imdb: 9.0, rt: 94, mc: 84 },
  '3 Idiots': { imdb: 8.4, rt: 91, mc: 79 },
  'RRR': { imdb: 8.1, rt: 94, mc: 75 },
  'Amélie': { imdb: 8.3, rt: 81, mc: 69 },
  'Oldboy': { imdb: 8.4, rt: 80, mc: 77 },
  'City of God': { imdb: 8.6, rt: 93, mc: 79 },
};

const CRITIC_SOURCES = [
  { name: 'IMDb', color: '#06b6d4', url: 'https://www.imdb.com' },
  { name: 'Rotten Tomatoes', color: '#06b6d4', url: 'https://www.rottentomatoes.com' },
  { name: 'Metacritic', color: '#00b300', url: 'https://www.metacritic.com' },
  { name: 'Letterboxd', color: '#00d000', url: 'https://letterboxd.com' },
  { name: 'TV Guide', color: '#1e90ff', url: 'https://www.tvg.com' },
];

const Review = () => {
  const [reviews] = useState(REVIEWS_DATA);
  const [filterLang, setFilterLang] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showForm, setShowForm] = useState(false);
  const [showCritics, setShowCritics] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newReview, setNewReview] = useState({ movie: '', rating: 5, title: '', text: '' });

  const filteredReviews = reviews
    .filter(r => {
      const matchesLang = filterLang === 'all' || r.lang === filterLang;
      const matchesSearch = !searchQuery ||
        r.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLang && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.date) - new Date(a.date);
    });

  const languages = ['all', ...new Set(reviews.map(r => r.lang))];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Review submitted successfully!');
    setShowForm(false);
    setNewReview({ movie: '', rating: 5, title: '', text: '' });
  };

  return (
    <div className="review-page">
      <div className="review-header">
        <div className="review-header__content">
          <h1>Movie Reviews & Critic Scores</h1>
          <p>Discover what critics and audiences are saying about movies from around the world</p>
        </div>
        <button className="write-review-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : 'Write a Review'}
        </button>
      </div>

      {/* Critic Scores Section */}
      <section className="critics-section">
        <div className="critics-header">
          <h2>Critics Scores</h2>
          <button
            className="toggle-critics-btn"
            onClick={() => setShowCritics(!showCritics)}
          >
            {showCritics ? 'Hide' : 'Show'} Critics
          </button>
        </div>

        {showCritics && (
          <div className="critics-grid">
            {Object.entries(CRITIC_SCORES).map(([movie, scores]) => (
              <div key={movie} className="critic-card">
                <h3 className="critic-card__title">{movie}</h3>
                <div className="critic-card__scores">
                  {scores.imdb && (
                    <a
                      href={`https://www.imdb.com/find?q=${encodeURIComponent(movie)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="critic-score imdb"
                      style={{ background: CRITIC_SOURCES[0].color }}
                    >
                      <span className="score-label">IMDb</span>
                      <span className="score-value">{scores.imdb}</span>
                    </a>
                  )}
                  {scores.rt && (
                    <a
                      href={`https://www.rottentomatoes.com/m/${movie.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="critic-score rt"
                      style={{ background: CRITIC_SOURCES[1].color }}
                    >
                      <span className="score-label">RT</span>
                      <span className="score-value">{scores.rt}%</span>
                    </a>
                  )}
                  {scores.mc && (
                    <a
                      href={`https://www.metacritic.com/m/${movie.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="critic-score mc"
                      style={{ background: CRITIC_SOURCES[2].color }}
                    >
                      <span className="score-label">MC</span>
                      <span className="score-value">{scores.mc}</span>
                    </a>
                  )}
                </div>
                <div className="critic-card__links">
                  <a href={`https://letterboxd.com/search/${encodeURIComponent(movie)}/`} target="_blank" rel="noopener noreferrer">Letterboxd</a>
                  <span className="separator">•</span>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(movie + ' review')}`} target="_blank" rel="noopener noreferrer">Google</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* External Review Links */}
      <section className="external-reviews-section">
        <h2>Find Professional Reviews</h2>
        <p>Check these major review platforms for professional critic reviews:</p>
        <div className="external-links">
          {CRITIC_SOURCES.map(source => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
              style={{ borderColor: source.color }}
            >
              <span className="external-link__dot" style={{ background: source.color }}></span>
              {source.name}
            </a>
          ))}
        </div>
      </section>

      {showForm && (
        <div className="review-form-container">
          <form className="review-form" onSubmit={handleSubmit}>
            <h2>Share Your Review</h2>
            <div className="form-group">
              <label>Movie Name</label>
              <input
                type="text"
                placeholder="Enter movie name..."
                value={newReview.movie}
                onChange={(e) => setNewReview({...newReview, movie: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Rating</label>
              <div className="rating-select">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={star <= newReview.rating ? 'active' : ''}
                    onClick={() => setNewReview({...newReview, rating: star})}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Review Title</label>
              <input
                type="text"
                placeholder="Give your review a title..."
                value={newReview.title}
                onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Your Review</label>
              <textarea
                placeholder="Share your thoughts about the movie..."
                value={newReview.text}
                onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="submit-btn">Submit Review</button>
          </form>
        </div>
      )}

      <div className="review-controls">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search movies or reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>Filter by Language:</label>
          <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)}>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang === 'all' ? 'All Languages' : lang}</option>
            ))}
          </select>
        </div>
        <div className="sort-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="likes">Most Liked</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {searchQuery && filteredReviews.length === 0 && (
        <div className="no-results">
          No reviews found for "{searchQuery}". Try a different search term.
        </div>
      )}

      <div className="reviews-grid">
        {filteredReviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-card__header">
              <span className="review-lang">{review.lang}</span>
              <div className="review-rating">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
            </div>
            <h3 className="review-card__title">{review.title}</h3>
            <p className="review-card__movie">{review.movieTitle}</p>
            <p className="review-card__text">{review.text}</p>
            <div className="review-card__footer">
              <span className="review-author">by {review.author}</span>
              <div className="review-actions">
                <span className="review-date">{review.date}</span>
                <button className="like-btn">
                  ♥ {review.likes}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Review;
