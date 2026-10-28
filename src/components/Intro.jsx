import { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';
import { business } from '../config.js';

const HOLD = 2300; // ms before the intro wipes away
const EXIT = 700;  // ms for the wipe

// Brand intro shown once per browser session after the age check.
// Any click, tap or key skips it; never shown with prefers-reduced-motion (see App).
export default function Intro({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  const skipRef = useRef(null);
  const done = useRef(false);

  function finish() {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    setTimeout(onDone, EXIT);
  }

  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true, focusVisible: false });
    const t = setTimeout(finish, HOLD);
    const onKey = () => finish();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`intro ${leaving ? 'is-leaving' : ''}`} onClick={finish} role="region" aria-label="Vape Express intro">
      <div className="intro__smoke" aria-hidden="true">
        <img className="intro__plume intro__plume--l" src="/fx/smoke-1.webp" alt="" />
        <img className="intro__plume intro__plume--r" src="/fx/smoke-3.webp" alt="" />
        <img className="intro__plume intro__plume--l2" src="/fx/smoke-2.webp" alt="" />
      </div>
      <div className="intro__content">
        <div className="intro__logo"><Logo height={76} /></div>
        <p className="intro__word" aria-hidden="true">
          <span className="hline"><span>Vape</span></span>
          <span className="hline hline--accent"><span>Express</span></span>
        </p>
        <span className="intro__rule" aria-hidden="true" />
        <p className="intro__tag mono">{business.tagline} — {business.city}</p>
      </div>
      <button ref={skipRef} type="button" className="intro__skip mono" onClick={(e) => { e.stopPropagation(); finish(); }}>
        Skip intro
      </button>
    </div>
  );
}
