// ============================================================================
// Deterministic Scores
// ============================================================================
// Stable hash + per-movie scores. Used everywhere we need a value that looks
// random but never changes between renders (or between users with the same
// favorites list). Without these, every Math.random() call produces flicker
// and critic scores reshuffle on every reload — which makes the UI feel buggy.
// ============================================================================

/**
 * FNV-1a 32-bit hash. Returns an unsigned 32-bit integer.
 * Fast, well-distributed, no dependencies.
 */
export function fnv1a(str) {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    // FNV prime 16777619 — multiply via shifts + add to stay in 32-bit space.
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

/**
 * Map a string + salt to a unit-interval float in [0, 1).
 * Different salts yield independent "random" streams from the same input.
 */
export const hashToUnit = (str, salt = 0) =>
  fnv1a(`${str}|${salt}`) / 0xFFFFFFFF;

/**
 * Today's date as a YYYY-MM-DD string in the user's local timezone.
 * Pure — no Date.now() so it's safe inside useMemo.
 */
export const todayKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Pick a stable "featured" movie from a list, rotating daily.
 *
 * Same calendar day → same movie (no flicker on reload).
 * Different day → different movie, distributed via FNV-1a hash.
 * Falls back to position 0 when the list is empty or non-array.
 *
 * Why this exists: the original selector used `(list || [])[0]`, which
 * locked the hero to whatever the API returned first — usually a single
 * movie for many days in a row. Hashing on YYYY-MM-DD spreads variety
 * across the list and breaks the "Decision to Leave every day" pattern.
 *
 * @param {Array} list - candidate movies (any length, including 0)
 * @param {string} [dateKey] - override "today" for testing
 * @returns {*} the chosen movie, or undefined when list is empty
 */
export function pickDailyFeatured(list, dateKey = todayKey()) {
  if (!Array.isArray(list) || list.length === 0) return undefined;
  if (list.length === 1) return list[0];
  // Hash the day string to an index. Adding a salt keeps this stream
  // independent of any other deterministic scores we hash on movie ids.
  const h = fnv1a(`featured|${dateKey}|0`);
  const idx = h % list.length;
  return list[idx];
}

/**
 * Deterministic critic scores for a movie.
 * - IMDB: 6.5 – 10.0 (one decimal)
 * - RT: 70 – 100 (whole percent)
 * - MC: 60 – 100 (whole points)
 * Same movie → same scores forever. Replaces the old Math.random() calls.
 */
export function computeDeterministicCriticScores(movie) {
  const seed = String(movie?.id ?? movie?.title ?? 'unknown');
  const imdb = Number((6.5 + hashToUnit(seed, 1) * 3.5).toFixed(1));
  const rt = Math.round(70 + hashToUnit(seed, 2) * 30);
  const mc = Math.round(60 + hashToUnit(seed, 3) * 40);
  return { imdb, rt, mc };
}

/**
 * Deterministic AI Match Score based on genre overlap with the user's
 * favorites list. Returns 0–100 (integer). Returns 0 when favorites is empty
 * so the badge doesn't render.
 *
 * Algorithm:
 *  1. Build a genre frequency map from all favorites (each genre count).
 *  2. For the candidate movie, sum the weights of overlapping genres.
 *  3. Normalize overlap by favorites count → base score (0–100).
 *  4. Blend with a ±6 rating boost (better-rated movies get a small lift).
 *  5. Add a small ±2 deterministic jitter so equal inputs still feel alive
 *     but the score is stable per (movie, favorites-snapshot).
 */
export function computeMatchScore(movie, favorites) {
  if (!movie || !favorites || favorites.length === 0) return 0;

  // Build frequency map of favorite genre IDs.
  const genreWeight = new Map();
  for (const fav of favorites) {
    const ids = extractGenreIds(fav);
    for (const id of ids) {
      genreWeight.set(id, (genreWeight.get(id) || 0) + 1);
    }
  }

  const movieGenreIds = extractGenreIds(movie);
  if (movieGenreIds.length === 0 || genreWeight.size === 0) return 0;

  // Sum the weights of overlapping genres.
  let overlap = 0;
  for (const id of movieGenreIds) {
    overlap += genreWeight.get(id) || 0;
  }

  // Normalize: if the movie has all of a single favorite's genres, score = 100.
  const base = Math.min(overlap / favorites.length, 1) * 100;

  // Mild rating boost: a 7.0 movie is neutral; 10.0 adds +6.
  const ratingBoost = ((movie.vote_average || 0) - 7) * 2;

  // Deterministic jitter for variety, clamped to 0–100.
  const jitter = Math.round(hashToUnit(`${movie.id}|match`, 7) * 4) - 2;

  return Math.max(0, Math.min(100, Math.round(base + ratingBoost + jitter)));
}

/**
 * Helper: extract a movie's genre IDs regardless of whether it came from
 * TMDB (`genre_ids: number[]`), a detail fetch (`genres: {id, name}[]`),
 * or legacy mock data (`genres: string[]`).
 */
function extractGenreIds(movie) {
  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length) {
    return movie.genre_ids.filter((id) => typeof id === 'number');
  }
  if (Array.isArray(movie.genres) && movie.genres.length) {
    const first = movie.genres[0];
    if (typeof first === 'object' && first !== null && 'id' in first) {
      return movie.genres.map((g) => g.id).filter(Boolean);
    }
    // Legacy mock data has genre strings; we don't have numeric IDs for those
    // so we can't compute a numeric overlap. Return empty to indicate "no match".
    return [];
  }
  return [];
}

/**
 * Deterministic "movie stats" used on the MovieDetails page (rating histogram
 * over the candidate's primary genre, audience split, etc.). Returns plain
 * numbers — the consumer formats them.
 */
export function computeMovieStats(movie) {
  const seed = String(movie?.id ?? 'unknown');
  const freshness = Math.round(hashToUnit(seed, 11) * 30 + 70); // 70–100
  const replay = Math.round(hashToUnit(seed, 12) * 40 + 50);    // 50–90
  const audience = Math.round(hashToUnit(seed, 13) * 25 + 70);   // 70–95
  const critics = Math.round(hashToUnit(seed, 14) * 30 + 60);    // 60–90
  return { freshness, replay, audience, critics };
}