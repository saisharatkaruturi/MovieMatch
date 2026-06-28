import { useEffect, useMemo, useState } from 'react';
import {
  fetchWatchProviders,
  getProvidersForCountry,
  getProviderLogoUrl,
  detectUserCountry,
  SUPPORTED_COUNTRIES,
} from '../services/tmdb';
import './WhereToWatch.css';

// Categories the UI renders in order. `key` must match the bucket name
// returned by getProvidersForCountry. `accent` controls the icon color and
// `icon` is the emoji shown next to the section title.
const CATEGORIES = [
  { key: 'streaming', label: 'Streaming', icon: '▶', accent: '#22d3ee' },
  { key: 'rent', label: 'Rent', icon: '⏱', accent: '#a78bfa' },
  { key: 'buy', label: 'Buy', icon: '🛒', accent: '#f472b6' },
  { key: 'free', label: 'Free', icon: '✨', accent: '#34d399' },
];

// Initial country — first try localStorage so user choice persists, then
// auto-detect from the browser. Falls back to US for SSR / unsupported regions.
const resolveInitialCountry = () => {
  if (typeof window === 'undefined') return 'US';
  // localStorage access can throw in private mode / quota errors — fall
  // through to the detector so the user always lands somewhere sensible.
  try {
    const saved = window.localStorage.getItem('moviematch_watch_country');
    if (saved && SUPPORTED_COUNTRIES.some((c) => c.code === saved)) return saved;
  } catch {
    // ignore
  }
  const detected = detectUserCountry();
  return SUPPORTED_COUNTRIES.some((c) => c.code === detected) ? detected : 'US';
};

const WhereToWatch = ({ movieId, movieTitle }) => {
  const [rawProviders, setRawProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState(resolveInitialCountry);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch providers once for this movie — the response covers every country
  // so subsequent country changes are pure client-side filtering.
  useEffect(() => {
    if (!movieId) return undefined;

    let cancelled = false;

    // setLoading is fine here because we're synchronizing React state to the
    // start of an external fetch — the standard pattern the rule allows.
    setLoading(true);
    setError(null);

    fetchWatchProviders(movieId)
      .then((data) => {
        if (cancelled) return;
        setRawProviders(data);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Unable to load watch providers right now.');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  // Persist user choice so we don't reset on every navigation.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('moviematch_watch_country', country);
    } catch {
      // ignore
    }
  }, [country]);

  const countryData = useMemo(
    () => getProvidersForCountry(rawProviders, country),
    [rawProviders, country],
  );

  const currentCountry = SUPPORTED_COUNTRIES.find((c) => c.code === country) || SUPPORTED_COUNTRIES[0];

  const hasAnyProviders = countryData && CATEGORIES.some(
    (cat) => Array.isArray(countryData[cat.key]) && countryData[cat.key].length > 0,
  );

  const searchLinks = useMemo(() => {
    const q = encodeURIComponent(movieTitle || '');
    return [
      { label: 'Google', href: `https://www.google.com/search?q=${q}+watch+online+streaming` },
      { label: 'YouTube', href: `https://www.youtube.com/results?search_query=${q}+full+movie` },
      { label: 'IMDb', href: `https://www.imdb.com/find?q=${q}` },
      { label: 'JustWatch', href: `https://www.justwatch.com/us/search?q=${q}` },
    ];
  }, [movieTitle]);

  return (
    <section className="where-to-watch" aria-labelledby="where-to-watch-title">
      <header className="wtw__header">
        <div className="wtw__title-block">
          <h2 id="where-to-watch-title" className="wtw__title">
            <span className="wtw__title-icon" aria-hidden="true">📺</span>
            Where to Watch
          </h2>
          <p className="wtw__subtitle">
            Find where {movieTitle ? <strong>{movieTitle}</strong> : 'this movie'} is streaming, renting, or buying in your region.
          </p>
        </div>

        <div
          className={`wtw__country ${dropdownOpen ? 'is-open' : ''}`}
          onBlur={(e) => {
            // Close when focus leaves the dropdown wrapper.
            if (!e.currentTarget.contains(e.relatedTarget)) setDropdownOpen(false);
          }}
        >
          <button
            type="button"
            className="wtw__country-button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <span className="wtw__country-flag" aria-hidden="true">{currentCountry.flag}</span>
            <span className="wtw__country-name">{currentCountry.name}</span>
            <span className="wtw__country-caret" aria-hidden="true">▾</span>
          </button>
          {dropdownOpen && (
            <ul className="wtw__country-menu" role="listbox">
              {SUPPORTED_COUNTRIES.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.code === country}
                    className={`wtw__country-option ${c.code === country ? 'is-active' : ''}`}
                    onClick={() => {
                      setCountry(c.code);
                      setDropdownOpen(false);
                    }}
                  >
                    <span className="wtw__country-flag" aria-hidden="true">{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {loading ? (
        <WhereToWatchSkeleton />
      ) : error ? (
        <div className="wtw__error">{error}</div>
      ) : !hasAnyProviders ? (
        <WhereToWatchEmpty movieTitle={movieTitle} searchLinks={searchLinks} />
      ) : (
        <div className="wtw__grid">
          {CATEGORIES.map((cat) => {
            const list = countryData?.[cat.key] || [];
            if (!list.length) return null;
            return (
              <ProviderCategory
                key={cat.key}
                category={cat}
                providers={list}
                countryLink={countryData?.link}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

const ProviderCategory = ({ category, providers, countryLink }) => {
  const [expanded, setExpanded] = useState(false);
  // Show 6 providers by default; reveal the rest behind "Show all" so the
  // section stays scannable even on movies with 20+ providers.
  const visible = expanded ? providers : providers.slice(0, 6);

  return (
    <div className={`wtw__category wtw__category--${category.key}`}>
      <div className="wtw__category-header">
        <span className="wtw__category-icon" style={{ background: category.accent }} aria-hidden="true">
          {category.icon}
        </span>
        <h3 className="wtw__category-title">{category.label}</h3>
        <span className="wtw__category-count">{providers.length}</span>
      </div>
      <div className="wtw__provider-grid">
        {visible.map((provider, index) => (
          <ProviderCard
            // provider_id is the stable TMDB identifier; falls back to name
            // for any oddly-shaped custom mock data.
            key={provider.provider_id || provider.provider_name || index}
            provider={provider}
            categoryKey={category.key}
            index={index}
          />
        ))}
      </div>
      {providers.length > 6 && (
        <button
          type="button"
          className="wtw__show-all"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? 'Show less' : `Show all ${providers.length}`}
        </button>
      )}
      {/* countryLink is TMDB's deep link to the platform page for this movie. */}
      {countryLink && category.key === 'streaming' && (
        <a
          className="wtw__deep-link"
          href={countryLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          View all availability on TMDB ↗
        </a>
      )}
    </div>
  );
};

const ProviderCard = ({ provider, categoryKey, index }) => {
  const logoUrl = getProviderLogoUrl(provider);
  const watchUrl = provider.link; // TMDB gives a per-provider URL when known
  const hasQuality = Array.isArray(provider.display_priorities) || provider.hd || provider['4k'];

  return (
    <article
      className="wtw__provider"
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      <div className="wtw__provider-logo-wrap">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${provider.provider_name} logo`}
            className="wtw__provider-logo"
            loading="lazy"
            onError={(e) => {
              // Fall back to a stylized initial if the TMDB logo 404s.
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="wtw__provider-logo-fallback"
          style={{ display: logoUrl ? 'none' : 'flex' }}
          aria-hidden="true"
        >
          {(provider.provider_name || '?').slice(0, 2).toUpperCase()}
        </div>
      </div>

      <div className="wtw__provider-info">
        <p className="wtw__provider-name">{provider.provider_name}</p>
        <p className="wtw__provider-type">{availabilityLabel(categoryKey)}</p>
        {hasQuality && (
          <div className="wtw__provider-badges">
            {provider.hd && <span className="wtw__badge wtw__badge--hd">HD</span>}
            {provider['4k'] && <span className="wtw__badge wtw__badge--4k">4K</span>}
          </div>
        )}
      </div>

      {watchUrl ? (
        <a
          className="wtw__watch-btn"
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="wtw__watch-icon" aria-hidden="true">▶</span>
          Watch Now
        </a>
      ) : (
        <span className="wtw__watch-btn wtw__watch-btn--disabled" aria-disabled="true">
          <span className="wtw__watch-icon" aria-hidden="true">▶</span>
          Watch Now
        </span>
      )}
    </article>
  );
};

const availabilityLabel = (key) => {
  switch (key) {
    case 'streaming': return 'Included with subscription';
    case 'rent': return 'Available to rent';
    case 'buy': return 'Available to buy';
    case 'free': return 'Free with ads';
    default: return 'Available';
  }
};

const WhereToWatchSkeleton = () => (
  <div className="wtw__skeleton" aria-busy="true" aria-label="Loading watch providers">
    {[0, 1].map((row) => (
      <div className="wtw__skeleton-row" key={row}>
        <div className="wtw__skeleton-title" />
        <div className="wtw__skeleton-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="wtw__skeleton-card" key={i}>
              <div className="wtw__skeleton-logo" />
              <div className="wtw__skeleton-line" />
              <div className="wtw__skeleton-line wtw__skeleton-line--short" />
              <div className="wtw__skeleton-button" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const WhereToWatchEmpty = ({ movieTitle, searchLinks }) => {
  const q = encodeURIComponent(movieTitle || 'this movie');
  // Provide a richer empty state that points users at external discovery
  // sources — Google / YouTube / IMDb / JustWatch — when TMDB has no data.
  const fallbackLinks = searchLinks || [
    { label: 'Google', href: `https://www.google.com/search?q=${q}+watch+online` },
    { label: 'YouTube', href: `https://www.youtube.com/results?search_query=${q}` },
    { label: 'IMDb', href: `https://www.imdb.com/find?q=${q}` },
    { label: 'JustWatch', href: `https://www.justwatch.com/us/search?q=${q}` },
  ];

  return (
    <div className="wtw__empty">
      <div className="wtw__empty-icon" aria-hidden="true">📭</div>
      <h3 className="wtw__empty-title">No streaming information is currently available for this movie.</h3>
      <p className="wtw__empty-text">
        Try searching for <em>{movieTitle || 'the title'}</em> on these platforms to find where it's playing.
      </p>
      <div className="wtw__empty-actions">
        {fallbackLinks.map((link) => (
          <a
            key={link.label}
            className="wtw__empty-btn"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            Search on {link.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default WhereToWatch;