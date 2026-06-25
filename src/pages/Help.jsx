import './Help.css';

const Help = () => {
  return (
    <div className="page">
      <div className="page__container">
        <h1 className="page__title">Help & Support</h1>
        <p className="page__subtitle">Get help with using MovieMatch</p>

        <div className="help-sections">
          <div className="help-card">
            <h2>Getting Started</h2>
            <p>MovieMatch is your gateway to world cinema! Browse movies by language, search for titles, and discover new films from around the globe.</p>
            <ul>
              <li>Click <strong>Home</strong> to see popular movies from all languages</li>
              <li>Use the <strong>Language</strong> dropdown to filter by specific languages</li>
              <li>Use <strong>Search</strong> to find specific movies</li>
              <li>Click on any movie card to see full details</li>
            </ul>
          </div>

          <div className="help-card">
            <h2>How to Use Language Filter</h2>
            <p>Follow these steps to find movies in your preferred language:</p>
            <ol>
              <li>Click the <strong>Language</strong> button in the navigation bar</li>
              <li>Select your preferred language from the dropdown</li>
              <li>The page will update to show movies in that language only</li>
              <li>Select "All" to see movies from all languages</li>
            </ol>
          </div>

          <div className="help-card">
            <h2>Available Languages</h2>
            <div className="language-grid">
              <span className="lang-tag">English</span>
              <span className="lang-tag">Hindi</span>
              <span className="lang-tag">Telugu</span>
              <span className="lang-tag">Tamil</span>
              <span className="lang-tag">Marathi</span>
              <span className="lang-tag">Punjabi</span>
              <span className="lang-tag">Gujarati</span>
              <span className="lang-tag">Bengali</span>
              <span className="lang-tag">Odia</span>
              <span className="lang-tag">Bhojpuri</span>
              <span className="lang-tag">German</span>
              <span className="lang-tag">French</span>
              <span className="lang-tag">Italian</span>
              <span className="lang-tag">Korean</span>
              <span className="lang-tag">Japanese</span>
              <span className="lang-tag">Chinese</span>
              <span className="lang-tag">Spanish</span>
            </div>
          </div>

          <div className="help-card">
            <h2>Contact Support</h2>
            <p>Need more help? Reach out to us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> support@moviematch.com</p>
              <p><strong>Hours:</strong> Monday - Friday, 9AM - 6PM IST</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
