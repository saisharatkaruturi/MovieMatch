import './Analysis.css';

const Analysis = () => {
  const stats = [
    { label: 'Total Movies', value: '70+' },
    { label: 'Languages', value: '18' },
    { label: 'Countries', value: '15+' },
    { label: 'Genres', value: '12' },
  ];

  const topRated = [
    { title: 'The Shawshank Redemption', rating: 9.3, lang: 'English' },
    { title: 'The Godfather', rating: 9.2, lang: 'English' },
    { title: 'Baahubali 2', rating: 8.5, lang: 'Telugu' },
    { title: 'Parasite', rating: 8.5, lang: 'Korean' },
    { title: 'Dangal', rating: 8.4, lang: 'Hindi' },
  ];

  const genreStats = [
    { genre: 'Drama', percent: 35 },
    { genre: 'Action', percent: 25 },
    { genre: 'Thriller', percent: 18 },
    { genre: 'Comedy', percent: 15 },
    { genre: 'Romance', percent: 7 },
  ];

  return (
    <div className="page">
      <div className="page__container">
        <h1 className="page__title">Movie Analysis</h1>
        <p className="page__subtitle">Insights and statistics about our movie database</p>

        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="analysis-grid">
          <div className="analysis-card">
            <h2>Top Rated Movies</h2>
            <table className="top-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Rating</th>
                  <th>Language</th>
                </tr>
              </thead>
              <tbody>
                {topRated.map((movie, i) => (
                  <tr key={i}>
                    <td>{movie.title}</td>
                    <td className="rating">★ {movie.rating}</td>
                    <td>{movie.lang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="analysis-card">
            <h2>Genre Distribution</h2>
            {genreStats.map((item) => (
              <div key={item.genre} className="genre-bar">
                <div className="genre-bar__label">
                  <span>{item.genre}</span>
                  <span>{item.percent}%</span>
                </div>
                <div className="genre-bar__track">
                  <div
                    className="genre-bar__fill"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="analysis-card">
            <h2>Language Coverage</h2>
            <p>Our database includes movies from major film industries:</p>
            <ul className="coverage-list">
              <li><strong>Indian Cinema:</strong> Hindi, Telugu, Tamil, Marathi, Punjabi, Gujarati, Bengali, Odia, Bhojpuri</li>
              <li><strong>European Cinema:</strong> German, French, Italian, Spanish</li>
              <li><strong>Asian Cinema:</strong> Korean, Japanese, Chinese</li>
              <li><strong>Global:</strong> English (Hollywood)</li>
            </ul>
          </div>

          <div className="analysis-card">
            <h2>Year Range</h2>
            <p>Movies from <strong>1900 to 2025</strong></p>
            <p>Including classics from early cinema to the latest blockbusters.</p>
            <div className="year-highlight">
              <span>1900</span>
              <span className="year-arrow">→</span>
              <span>2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
