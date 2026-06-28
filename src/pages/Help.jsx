import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';
import { MotionSection } from '../components/MotionSection';
import './Help.css';

const CATEGORIES = [
  { key: 'getting-started', label: 'Getting Started', icon: '🚀' },
  { key: 'language-filter', label: 'Language Filter', icon: '🌐' },
  { key: 'search', label: 'Search', icon: '🔍' },
  { key: 'favorites', label: 'Favorites & Watchlist', icon: '❤️' },
  { key: 'troubleshooting', label: 'Troubleshooting', icon: '🛠' },
  { key: 'contact', label: 'Contact', icon: '✉️' },
];

const FAQ = [
  {
    cat: 'getting-started',
    q: 'What is MovieMatch?',
    a: 'MovieMatch is a curated world cinema discovery platform. Browse 1,400+ films across 20+ languages, from silent-era classics to the latest blockbusters. Every movie includes critic scores, cast & crew, where to watch, and an AI Match score based on your favorites.',
  },
  {
    cat: 'getting-started',
    q: 'How do I navigate the site?',
    a: 'Use the navbar to switch between Home (catalog), Artists (people), Search, and other pages. Click any movie card for full details, or any artist card to see filmography. Use the search overlay (Cmd/Ctrl+K) to jump straight to a title.',
  },
  {
    cat: 'getting-started',
    q: 'Is MovieMatch free?',
    a: 'Yes. MovieMatch is a free discovery tool. Some links go to streaming platforms where rentals or subscriptions may apply.',
  },
  {
    cat: 'language-filter',
    q: 'How do I filter by language?',
    a: 'Open the Language dropdown in the navigation bar and pick one. The Home page updates to show only films in that language. You can combine a language with genre filters for a more precise slice of the catalog.',
  },
  {
    cat: 'language-filter',
    q: 'What languages are supported?',
    a: 'English, Hindi, Telugu, Tamil, Marathi, Punjabi, Gujarati, Bengali, Odia, Bhojpuri, German, French, Italian, Korean, Japanese, Chinese, Spanish, Portuguese, Russian, and Danish. The Home dropdown lists all of them.',
  },
  {
    cat: 'language-filter',
    q: 'Can I filter by multiple genres at once?',
    a: 'Yes. The genre filter on the Home page supports two modes — Any (OR matching) and All (AND matching). Toggle between them using the chip in the filter header.',
  },
  {
    cat: 'search',
    q: 'How does search work?',
    a: 'Visit /search or hit Cmd/Ctrl+K from anywhere. Type a title, director, or actor. Results appear after a 400 ms debounce. Your recent searches persist in localStorage so you can re-run them quickly.',
  },
  {
    cat: 'search',
    q: 'Can I search by voice?',
    a: 'Yes — if your browser supports the Web Speech API (Chrome, Edge, Safari). Click the microphone icon next to the search input. We will only listen while the button is highlighted.',
  },
  {
    cat: 'favorites',
    q: 'How do favorites and watchlist work?',
    a: 'Hover any movie card to reveal the action bar, then click the heart to favorite or the bookmark to add to your watchlist. Both lists persist in your browser via localStorage — no account required.',
  },
  {
    cat: 'favorites',
    q: 'What is the AI Match score?',
    a: 'Once you favorite at least one film, every movie card shows an AI Match score from 0–100. It is computed from the genre overlap between your favorites and the candidate movie, plus a small rating boost. Scores update live as your favorites change.',
  },
  {
    cat: 'favorites',
    q: 'How do I clear my favorites?',
    a: 'Open the Favorites page from the navbar. There is a Clear All button that empties both your favorites and watchlist. This action cannot be undone, but you can always re-favorite films individually.',
  },
  {
    cat: 'troubleshooting',
    q: 'Why are some posters missing?',
    a: 'TMDB occasionally returns movies without posters or with placeholder images. We fall back to a gradient avatar with the film title initial. Poster enrichment runs in the background and updates cards as soon as data lands.',
  },
  {
    cat: 'troubleshooting',
    q: 'Why are critic scores the same on every reload?',
    a: 'We generate deterministic critic scores from a stable hash of the movie ID — so you get a stable 7.4/8.9/72% that does not flicker between renders. For a curated set of well-known titles, we use the canonical real-world scores instead.',
  },
  {
    cat: 'troubleshooting',
    q: 'Where to Watch shows no results?',
    a: 'Watch provider availability is region-specific. Use the country selector on the Where to Watch panel to pick a different country. If a film still has no providers listed, it may not be available for streaming, rent, or purchase in any region we cover.',
  },
  {
    cat: 'contact',
    q: 'How do I report a bug or request a feature?',
    a: 'Send us a note at support@moviematch.com. We try to respond within 2 business days.',
  },
  {
    cat: 'contact',
    q: 'Where can I follow updates?',
    a: 'The MovieMatch footer lists the year range and version. Major releases ship every few weeks — keep an eye on the changelog card on the Home page.',
  },
];

const Help = () => {
  const [activeCat, setActiveCat] = useState('getting-started');
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState('');

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQ.filter((item) => {
      const matchesCat = activeCat === 'all' || item.cat === activeCat;
      const matchesSearch = !q
        || item.q.toLowerCase().includes(q)
        || item.a.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCat, search]);

  const grouped = useMemo(() => {
    const out = {};
    filteredFaqs.forEach((item) => {
      if (!out[item.cat]) out[item.cat] = [];
      out[item.cat].push(item);
    });
    return out;
  }, [filteredFaqs]);

  const visibleCategories = activeCat === 'all'
    ? CATEGORIES.filter((c) => grouped[c.key]?.length > 0)
    : CATEGORIES.filter((c) => c.key === activeCat && grouped[c.key]?.length > 0);

  return (
    <div className="help">
      {/* === Hero === */}
      <section className="help__hero">
        <div className="help__hero-bg" aria-hidden="true">
          <div className="help__hero-glow help__hero-glow--cyan" />
          <div className="help__hero-glow help__hero-glow--violet" />
        </div>
        <div className="help__hero-inner">
          <motion.span
            className="help__kicker"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="help__kicker-dot" />
            How can we help?
          </motion.span>
          <motion.h1
            className="text-display"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            Help & Support
          </motion.h1>
          <motion.p
            className="help__sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            Everything you need to get the most out of MovieMatch — searching, filters,
            favorites, and where to watch.
          </motion.p>

          <motion.div
            className="help__search"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="help__search-icon">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              className="help__search-input"
              placeholder="Search the help center…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search help articles"
            />
          </motion.div>
        </div>
      </section>

      <div className="help__container">
        {/* === Category tabs === */}
        <MotionSection className="help__section">
          <SectionHeader
            icon="📚"
            title="Browse by Category"
            kicker="Pick a topic or search above to find an answer."
          />
          <div className="help__categories" role="tablist" aria-label="Help categories">
            <button
              type="button"
              role="tab"
              aria-selected={activeCat === 'all'}
              className={`help-cat ${activeCat === 'all' ? 'is-active' : ''}`}
              onClick={() => { setActiveCat('all'); setOpenIndex(null); }}
            >
              <span className="help-cat__icon" aria-hidden="true">📋</span>
              All
            </button>
            {CATEGORIES.map((c) => {
              const hasMatches = grouped[c.key]?.length > 0;
              return (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={activeCat === c.key}
                  className={`help-cat ${activeCat === c.key ? 'is-active' : ''} ${!hasMatches ? 'is-empty' : ''}`}
                  onClick={() => { setActiveCat(c.key); setOpenIndex(null); }}
                  disabled={!hasMatches && search.trim().length > 0}
                  title={!hasMatches && search.trim().length > 0 ? 'No matches in this category' : c.label}
                >
                  <span className="help-cat__icon" aria-hidden="true">{c.icon}</span>
                  {c.label}
                </button>
              );
            })}
          </div>
        </MotionSection>

        {/* === FAQ list === */}
        <MotionSection className="help__section">
          {filteredFaqs.length === 0 ? (
            <div className="help__empty">
              <span aria-hidden="true">🔍</span>
              <h3 className="text-display">No matches for "{search}"</h3>
              <p>Try a different keyword, or browse the categories above.</p>
            </div>
          ) : (
            <div className="help__groups">
              {visibleCategories.map((cat) => (
                <section key={cat.key} className="help-group">
                  <h2 className="help-group__title">
                    <span className="help-group__icon" aria-hidden="true">{cat.icon}</span>
                    {cat.label}
                  </h2>
                  <div className="help-faq">
                    {grouped[cat.key].map((item, i) => {
                      const idx = `${cat.key}-${i}`;
                      const isOpen = openIndex === idx;
                      return (
                        <article
                          key={idx}
                          className={`help-faq__item ${isOpen ? 'is-open' : ''}`}
                        >
                          <button
                            type="button"
                            className="help-faq__q"
                            onClick={() => setOpenIndex(isOpen ? null : idx)}
                            aria-expanded={isOpen}
                          >
                            <span className="help-faq__q-text">{item.q}</span>
                            <span className="help-faq__caret" aria-hidden="true">
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d={isOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                key="answer"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                style={{ overflow: 'hidden' }}
                              >
                                <p className="help-faq__a">{item.a}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </MotionSection>

        {/* === Contact strip === */}
        <MotionSection className="help__section">
          <div className="help-contact">
            <div className="help-contact__text">
              <h3 className="text-display">Still stuck?</h3>
              <p>
                Drop us a line and we'll get back to you within 2 business days.
              </p>
            </div>
            <a
              className="detail-btn detail-btn--primary"
              href="mailto:support@moviematch.com"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 6L2 7" />
              </svg>
              support@moviematch.com
            </a>
          </div>
        </MotionSection>
      </div>
    </div>
  );
};

export default Help;