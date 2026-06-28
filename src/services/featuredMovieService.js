// ============================================================================
// Featured movie service
// ============================================================================
// Selects a deterministic "featured today" movie from the existing dataset
// already in memory (no extra TMDB call). Same input -> same output, every
// user on the same calendar day lands on the same index.
//
// The algorithm is the rotation described in the spec:
//
//     featuredMovieIndex = daysSinceEpoch % languageMovies.length
//
// Why modulo? It guarantees:
//   - automatic daily updates (the index advances by 1 each day)
//   - no backend required (pure function over local state)
//   - same movie for every user (same day -> same integer)
//   - predictable rotation (order = order returned by the data layer)
//   - graceful handling of small pools (modulo on a length-2 list still
//     rotates between the two; we never run out or repeat the same item
//     more than once per cycle)
//
// The service exposes two builders + one selector. The hook and component
// stay presentation-only and never import these helpers directly.
// ============================================================================

import { daysSinceEpoch } from '../utils/dateHelpers';

/**
 * Pool contract: an array of movie-like objects with at least { id, title,
 * original_language }. Anything else (poster_path, vote_average, overview,
 * release_date, genre_ids) is forwarded to the consumer as-is.
 */

/**
 * Filter the in-memory movie list to just the rows whose original_language
 * matches the requested code. Returns the array unchanged if it's already
 * filtered (the data layer usually pre-filters by with_original_language
 * on the server, so this is a fast no-op safety net).
 */
export function buildLanguagePool(movies, language) {
  if (!Array.isArray(movies) || movies.length === 0) return [];
  if (!language || language === 'all') return [];
  // The data layer already filters by language, so identity-compare first.
  // If the caller passes a heterogeneous list, fall back to a real filter.
  const allMatch = movies.every((m) => m && m.original_language === language);
  if (allMatch) return movies;
  return movies.filter((m) => m && m.original_language === language);
}

/**
 * For the "all" / World Cinema case, build a mixed-language pool: one
 * top-rated movie per language so the rotation always visits different
 * industries. Ties broken by vote_count (more votes wins), then by id
 * (stable order).
 *
 * Why per-language and not just the global pool? Because the global list
 * is dominated by English/Hollywood — without bucketing, "Today's
 * featured" would essentially always be English. The bucket guarantees
 * the cycle visits Marathi, Telugu, Korean, etc. in turn.
 */
export function buildAllLanguagesPool(movies) {
  if (!Array.isArray(movies) || movies.length === 0) return [];

  const byLang = new Map();
  for (const movie of movies) {
    if (!movie || !movie.original_language) continue;
    const existing = byLang.get(movie.original_language);
    if (!existing) {
      byLang.set(movie.original_language, movie);
      continue;
    }
    // Replace if higher rated; tie-break on more votes, then lower id.
    const better =
      (movie.vote_average ?? 0) > (existing.vote_average ?? 0)
      || ((movie.vote_average ?? 0) === (existing.vote_average ?? 0)
          && (movie.vote_count ?? 0) > (existing.vote_count ?? 0))
      || ((movie.vote_average ?? 0) === (existing.vote_average ?? 0)
          && (movie.vote_count ?? 0) === (existing.vote_count ?? 0)
          && String(movie.id).localeCompare(String(existing.id)) < 0);
    if (better) byLang.set(movie.original_language, movie);
  }

  // Stable order: sort language codes alphabetically so the rotation
  // sequence is reproducible (not insertion-order dependent).
  return [...byLang.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, movie]) => movie);
}

/**
 * Pick today's featured movie from a pool. Pure.
 * Returns null when the pool is empty (caller renders fallback).
 *
 * `date` is optional — defaults to "now" — and exists for testability
 * and for the rare case where a parent wants to pin the day key.
 */
export function selectFeaturedMovie(pool, date = new Date()) {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  const dayIndex = daysSinceEpoch(date);
  const idx = ((dayIndex % pool.length) + pool.length) % pool.length;
  // The double-modulo above is the canonical "always positive mod" idiom —
  // safe even if daysSinceEpoch ever returns a negative integer (it can't
  // today, but the guard is cheap and removes a class of bugs).
  return pool[idx];
}

/**
 * Resolve the right pool for a given language and select today's featured
 * movie in one call. Keeps the hook readable.
 */
export function resolveFeaturedMovie({ movies, language, date = new Date() }) {
  const pool = language === 'all'
    ? buildAllLanguagesPool(movies)
    : buildLanguagePool(movies, language);
  return {
    featured: selectFeaturedMovie(pool, date),
    poolSize: pool.length,
  };
}