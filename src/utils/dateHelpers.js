// ============================================================================
// Date helpers — pure functions used by the daily featured movie service.
//
// All helpers are timezone-aware in the local sense (the user's browser).
// Two users on the same calendar day see the same integer; users straddling
// midnight see a different "today" — that's intentional. No Date.now()
// inside the helpers themselves so they're safe to call from useMemo.
// ============================================================================

/**
 * Integer number of full days since the Unix epoch (1970-01-01 UTC), computed
 * against the user's local midnight so that everyone on the same calendar
 * day lands on the same value.
 *
 * Why not Math.floor(Date.now() / 86_400_000)? Because that uses UTC midnight
 * and would shift relative to most users' perceived "today."
 */
export function daysSinceEpoch(date = new Date()) {
  // Build a Date at local midnight, then diff against the epoch in days.
  const localMidnight = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  // 86_400_000 = ms in one day. Floor division gives the day count.
  return Math.floor(localMidnight / 86_400_000);
}

/**
 * Time remaining until the next local midnight.
 * Returns { hours, minutes, seconds, totalMs }. Always non-negative.
 */
export function timeUntilNextMidnight(date = new Date()) {
  const now = date.getTime();
  const nextMidnight = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    0, 0, 0, 0,
  ).getTime();
  const totalMs = Math.max(0, nextMidnight - now);
  const totalSeconds = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, totalMs };
}

/**
 * Format a { hours, minutes, seconds } triple as "07h 42m 18s".
 * Components are zero-padded to two digits so the string never jumps in width.
 */
export function formatCountdown({ hours, minutes, seconds }) {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');
  return `${h}h ${m}m ${s}s`;
}