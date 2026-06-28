import './SkeletonCard.css';

// SkeletonCard — matches MovieCard aspect/structure so layout doesn't jump
// when the real cards arrive. Uses a shimmer gradient that loops infinitely.

const SkeletonCard = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-card__poster" />
    <div className="skeleton-card__info">
      <div className="skeleton-card__line skeleton-card__line--lg" />
      <div className="skeleton-card__line skeleton-card__line--sm" />
      <div className="skeleton-card__chips">
        <div className="skeleton-card__chip" />
        <div className="skeleton-card__chip" />
      </div>
    </div>
  </div>
);

// SkeletonGrid — drop-in replacement for the movie grid while data loads.
export const SkeletonGrid = ({ count = 12 }) => (
  <div className="skeleton-grid" role="status" aria-label="Loading movies">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
    <span className="visually-hidden">Loading…</span>
  </div>
);

export default SkeletonCard;