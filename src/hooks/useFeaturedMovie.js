// ============================================================================
// useFeaturedMovie — picks today's featured movie for a given language and
// exposes a live countdown to tomorrow's rollover.
//
// The hook is the only place that owns time. The service is pure and the
// component is presentational — that split keeps re-renders local and
// means the countdown ticking 1 Hz doesn't bubble up through Home.
//
// Returned shape:
//   {
//     featured:    Movie | null,
//     poolSize:    number,
//     fallback:    boolean,            // true when featured === null
//     countdown:   string,             // "07h 42m 18s"
//     countdownMs: number,             // raw ms remaining (for tests / debug)
//   }
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import {
  resolveFeaturedMovie,
} from '../services/featuredMovieService';
import {
  daysSinceEpoch,
  timeUntilNextMidnight,
  formatCountdown,
} from '../utils/dateHelpers';

export function useFeaturedMovie({ allMovies, language }) {
  // pool + featured only change when (movies, language) or the calendar day
  // change. The day key is captured in the deps so a tab left open across
  // midnight refreshes automatically (same logic as the existing hero).
  const [dayKey, setDayKey] = useState(() => daysSinceEpoch());

  const { featured, poolSize } = useMemo(
    () => resolveFeaturedMovie({ movies: allMovies, language, date: new Date() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allMovies, language, dayKey],
  );

  // Countdown ticks at 1 Hz. We hold a string instead of an object so
  // consumers can drop the value straight into JSX without re-formatting.
  const [countdownString, setCountdownString] = useState(() => {
    const c = timeUntilNextMidnight();
    return formatCountdown(c);
  });
  const [countdownMs, setCountdownMs] = useState(
    () => timeUntilNextMidnight().totalMs,
  );

  useEffect(() => {
    // Refresh the day key + countdown at midnight. setInterval(1s) is cheap
    // and means we don't need a separate "midnight" timer.
    const id = setInterval(() => {
      const today = daysSinceEpoch();
      if (today !== dayKey) setDayKey(today);

      const next = timeUntilNextMidnight();
      setCountdownString(formatCountdown(next));
      setCountdownMs(next.totalMs);
    }, 1000);
    return () => clearInterval(id);
  }, [dayKey]);

  return {
    featured,
    poolSize,
    fallback: featured === null,
    countdown: countdownString,
    countdownMs,
  };
}

export default useFeaturedMovie;