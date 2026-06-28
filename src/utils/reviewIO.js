// ============================================================================
// Review I/O — backup + restore user-submitted reviews.
//
// Why this exists: reviews are persisted in localStorage under
// `moviematch_user_reviews_v1`. If the user clears site data, switches
// browser, or hits an unusual quota error, the reviews vanish silently.
// Export downloads a portable JSON; Import merges a JSON back into the
// same localStorage key the submit handler uses.
//
// File format (versioned so future changes don't break old imports):
//   {
//     app: 'moviematch',
//     version: 1,
//     exportedAt: '2026-06-28T12:34:56.000Z',
//     reviews: [ { id, movieTitle, movieId, lang, rating, author,
//                  date, title, text, likes, source } ]
//   }
// ============================================================================

const STORAGE_KEY = 'moviematch_user_reviews_v1';
const EXPORT_VERSION = 1;
const APP_TAG = 'moviematch';

const isValidReview = (r) => (
  r
  && typeof r === 'object'
  && typeof r.movieTitle === 'string'
  && typeof r.title === 'string'
  && typeof r.text === 'string'
  && Number.isFinite(r.rating)
);

/**
 * Read the current list of user-submitted reviews from localStorage.
 * Returns [] on any read/parse failure or when the payload isn't an array.
 */
export function readUserReviews() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Merge-write `reviews` into localStorage:
 *   - prepends incoming reviews
 *   - dedupes by `id` (incoming wins if both sides have the same id)
 *   - caps at 50 to match the submit handler's quota
 */
export function writeUserReviews(reviews) {
  if (typeof window === 'undefined') return;
  try {
    const list = readUserReviews();
    const byId = new Map(list.map((r) => [r.id, r]));
    for (const r of reviews) byId.set(r.id, r);
    const merged = [...byId.values()]
      // Newest first: import order already matters, then preserve any
      // pre-existing rows whose ids weren't in the import batch.
      .sort((a, b) => String(b.id).localeCompare(String(a.id)))
      .slice(0, 50);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Build the export payload. Pure function — no I/O.
 */
export function buildExportPayload(reviews) {
  return {
    app: APP_TAG,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    reviews: Array.isArray(reviews) ? reviews.slice(0, 50) : [],
  };
}

/**
 * Trigger a browser download of the payload as a JSON file.
 * Filename includes the date so multiple exports don't clobber each other.
 */
export function downloadReviewsJSON(reviews) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const payload = buildExportPayload(reviews);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().split('T')[0];
  a.download = `moviematch-reviews-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Validate an arbitrary parsed JSON object. Accepts either:
 *   - the full export payload { app, version, reviews: [...] }
 *   - or a bare array of reviews
 *
 * Returns a normalized list of valid review rows (skips bad ones).
 */
export function parseImportedPayload(parsed) {
  let list = null;
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.reviews)) {
    list = parsed.reviews;
  }
  if (!list) return { ok: false, reason: 'No reviews array found in file.', reviews: [] };
  const valid = list.filter(isValidReview);
  if (valid.length === 0) {
    return { ok: false, reason: 'No valid review entries in file.', reviews: [] };
  }
  return { ok: true, reason: '', reviews: valid };
}

/**
 * Read a File/Blob as text. Returns a Promise so the caller can await.
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Convenience: read file -> parse -> validate -> merge into localStorage.
 * Returns { ok, count, reason }.
 */
export async function importReviewsFromFile(file) {
  try {
    const text = await readFileAsText(file);
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, count: 0, reason: 'File is not valid JSON.' };
    }
    const result = parseImportedPayload(parsed);
    if (!result.ok) return { ok: false, count: 0, reason: result.reason };
    writeUserReviews(result.reviews);
    return { ok: true, count: result.reviews.length, reason: '' };
  } catch (err) {
    return { ok: false, count: 0, reason: err?.message || 'Import failed.' };
  }
}

/**
 * Convenience: import from a raw JSON string (useful for paste-textarea
 * fallback if we ever add one). Returns the same shape as the file variant.
 */
export function importReviewsFromText(text) {
  try {
    const parsed = JSON.parse(text);
    const result = parseImportedPayload(parsed);
    if (!result.ok) return { ok: false, count: 0, reason: result.reason };
    writeUserReviews(result.reviews);
    return { ok: true, count: result.reviews.length, reason: '' };
  } catch {
    return { ok: false, count: 0, reason: 'Text is not valid JSON.' };
  }
}
