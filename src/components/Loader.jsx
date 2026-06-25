import { useEffect, useState } from 'react';
import './Loader.css';

const Loader = ({ onComplete }) => {
  const [phase, setPhase] = useState('start');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('spin'), 100),
      setTimeout(() => setPhase('reveal'), 2000),
      setTimeout(() => setPhase('fade'), 3500),
      setTimeout(() => onComplete(), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`loader loader--${phase}`}>
      <div className="loader__scanline" />
      <div className="loader__ring" />
      <div className="loader__ring" />
      <div className="loader__ring" />
      <div className="loader__particles">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="loader__particle" />
        ))}
      </div>
      <div className="loader__content">
        <img src="/logo.svg" alt="MovieMatch" className="loader__logo" />
        <h1 className="loader__title">MovieMatch</h1>
        <p className="loader__subtitle">World Cinema</p>
      </div>
    </div>
  );
};

export default Loader;
