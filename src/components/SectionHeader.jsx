import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './SectionHeader.css';

// Reusable section header: emoji/icon, title, optional kicker, optional action.
// Used at the top of every homepage carousel and on inner pages.

const SectionHeader = ({
  icon,
  title,
  kicker,
  actionLabel,
  actionHref,
  meta,
  align = 'left',
}) => {
  const TitleTag = motion.h2;
  return (
    <motion.header
      className={`section-header section-header--${align}`}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="section-header__left">
        {icon && (
          <span className="section-header__icon" aria-hidden="true">{icon}</span>
        )}
        <div className="section-header__text">
          <TitleTag className="section-header__title text-display">{title}</TitleTag>
          {kicker && <p className="section-header__kicker">{kicker}</p>}
        </div>
      </div>
      <div className="section-header__right">
        {meta && <span className="section-header__meta text-mono-num">{meta}</span>}
        {actionLabel && actionHref && (
          <Link to={actionHref} className="section-header__action">
            {actionLabel}
            <span className="section-header__action-arrow" aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </motion.header>
  );
};

export default SectionHeader;