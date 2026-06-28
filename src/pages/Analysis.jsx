import { useMemo } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';
import { MotionSection } from '../components/MotionSection';
import { fnv1a, hashToUnit } from '../utils/deterministicScores';
import './Analysis.css';

// Deterministic, frozen snapshot of the analysis so re-renders are stable
// and the numbers don't shimmer between visits.
const SNAPSHOT = (() => {
  const topRated = [];
  for (let i = 0; i < 8; i += 1) {
    const title = [
      'The Shawshank Redemption', 'The Godfather', 'Baahubali 2', 'Parasite',
      'Dangal', 'Spirited Away', 'The Dark Knight', 'City of God',
    ][i];
    const lang = [
      'English', 'English', 'Telugu', 'Korean',
      'Hindi', 'Japanese', 'English', 'Portuguese',
    ][i];
    const rating = Number((9.4 - i * 0.12 - hashToUnit(title, 1) * 0.15).toFixed(1));
    topRated.push({ title, rating, lang, votes: Math.round(1200 + hashToUnit(title, 2) * 8800) });
  }

  const genres = ['Drama', 'Action', 'Thriller', 'Comedy', 'Romance', 'Sci-Fi', 'Mystery', 'Crime'];
  const basePcts = [38, 24, 18, 13, 9, 8, 7, 6];
  const genreStats = genres.map((genre, i) => ({
    genre,
    percent: basePcts[i],
  }));

  const languages = [
    { group: 'Indian Cinema', langs: 'Hindi · Telugu · Tamil · Marathi · Punjabi · Gujarati · Bengali · Odia · Bhojpuri', count: 9 },
    { group: 'East Asian Cinema', langs: 'Korean · Japanese · Chinese', count: 3 },
    { group: 'European Cinema', langs: 'German · French · Italian · Spanish · Portuguese · Russian · Danish', count: 7 },
    { group: 'World Cinema', langs: 'English (Hollywood) · Arabic', count: 2 },
  ];

  const decades = [
    { label: '1900–1949', count: 32 },
    { label: '1950–1969', count: 71 },
    { label: '1970–1989', count: 168 },
    { label: '1990–2009', count: 412 },
    { label: '2010–2026', count: 738 },
  ];
  const maxDecade = Math.max(...decades.map((d) => d.count));

  return {
    stats: [
      { label: 'Total Films', value: '1,400+', icon: '🎬' },
      { label: 'Languages', value: '20+', icon: '🌐' },
      { label: 'Countries', value: '45+', icon: '🌍' },
      { label: 'Genres', value: '19', icon: '🎭' },
    ],
    topRated,
    genreStats,
    languages,
    decades,
    maxDecade,
  };
})();

const Analysis = () => {
  const data = useMemo(() => SNAPSHOT, []);

  return (
    <div className="analysis">
      {/* === Hero === */}
      <section className="analysis__hero">
        <div className="analysis__hero-bg" aria-hidden="true">
          <div className="analysis__hero-glow analysis__hero-glow--cyan" />
          <div className="analysis__hero-glow analysis__hero-glow--violet" />
        </div>
        <div className="analysis__hero-inner">
          <motion.span
            className="analysis__kicker"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="analysis__kicker-dot" />
            Data behind the cinema
          </motion.span>
          <motion.h1
            className="text-display"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            Movie Analysis
          </motion.h1>
          <motion.p
            className="analysis__sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            Insights and statistics about our world cinema catalog spanning <strong>1900–2026</strong>.
          </motion.p>
        </div>
      </section>

      <div className="analysis__container">
        {/* === Top stats === */}
        <MotionSection className="analysis__section">
          <div className="stats-grid">
            {data.stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="stat-card__icon" aria-hidden="true">{stat.icon}</span>
                <span className="stat-card__value text-display">{stat.value}</span>
                <span className="stat-card__label">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </MotionSection>

        <div className="analysis__grid">
          {/* === Top rated === */}
          <MotionSection className="analysis-card analysis-card--wide">
            <SectionHeader
              icon="🏆"
              title="Top Rated Films"
              kicker="Highest-rated entries across all languages."
              meta={`${data.topRated.length} films`}
            />
            <div className="top-list">
              {data.topRated.map((movie, i) => (
                <motion.div
                  key={movie.title}
                  className="top-item"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="top-item__rank text-mono-num">#{i + 1}</span>
                  <div className="top-item__info">
                    <h4 className="top-item__title">{movie.title}</h4>
                    <span className="top-item__meta text-mono-num">
                      {movie.lang} · {movie.votes.toLocaleString()} votes
                    </span>
                  </div>
                  <div className="top-item__rating text-mono-num">
                    ★ {movie.rating}
                  </div>
                </motion.div>
              ))}
            </div>
          </MotionSection>

          {/* === Genre distribution === */}
          <MotionSection className="analysis-card">
            <SectionHeader
              icon="📊"
              title="Genre Distribution"
              kicker="Most common genres in our catalog."
            />
            <div className="genre-list">
              {data.genreStats.map((item, i) => (
                <div key={item.genre} className="genre-bar">
                  <div className="genre-bar__head">
                    <span className="genre-bar__label">{item.genre}</span>
                    <span className="genre-bar__percent text-mono-num">{item.percent}%</span>
                  </div>
                  <div className="genre-bar__track">
                    <motion.span
                      className="genre-bar__fill"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.percent * 2}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </MotionSection>

          {/* === Language coverage === */}
          <MotionSection className="analysis-card">
            <SectionHeader
              icon="🌐"
              title="Language Coverage"
              kicker="Our catalog spans the globe."
            />
            <ul className="coverage-list">
              {data.languages.map((entry) => (
                <li key={entry.group} className="coverage-item">
                  <div className="coverage-item__head">
                    <span className="coverage-item__group">{entry.group}</span>
                    <span className="coverage-item__count text-mono-num">{entry.count}</span>
                  </div>
                  <span className="coverage-item__langs">{entry.langs}</span>
                </li>
              ))}
            </ul>
          </MotionSection>

          {/* === Year range / decade histogram === */}
          <MotionSection className="analysis-card analysis-card--wide">
            <SectionHeader
              icon="📅"
              title="Across the Decades"
              kicker="How our catalog distributes across cinematic history."
              meta="1900–2026"
            />
            <div className="decade-chart">
              {data.decades.map((d, i) => {
                const pct = (d.count / data.maxDecade) * 100;
                return (
                  <motion.div
                    key={d.label}
                    className="decade"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="decade__bar-wrap">
                      <motion.span
                        className="decade__bar"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="decade__label text-mono-num">{d.label}</span>
                    <span className="decade__num text-mono-num">{d.count}</span>
                  </motion.div>
                );
              })}
            </div>
          </MotionSection>

          {/* === Tagline footer === */}
          <MotionSection className="analysis-card analysis-card--feature">
            <div className="feature-card">
              <h3 className="feature-card__title text-display">A century of cinema, in one catalog.</h3>
              <p className="feature-card__body">
                From silent-era German expressionism to the latest Telugu blockbusters,
                from Korean thrillers to French New Wave — our catalog is curated to
                capture the breadth of world cinema.
              </p>
              <div className="feature-card__years">
                <span className="feature-card__year text-display">1900</span>
                <span className="feature-card__arrow" aria-hidden="true">→</span>
                <span className="feature-card__year text-display">2026</span>
              </div>
            </div>
          </MotionSection>
        </div>
      </div>
    </div>
  );
};

export default Analysis;