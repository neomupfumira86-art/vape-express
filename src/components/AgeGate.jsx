import { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';
import { nicotineWarning } from '../config.js';

export default function AgeGate({ onAccept }) {
  const [left, setLeft] = useState(false);
  const yes = useRef(null);
  useEffect(() => yes.current?.focus(), [left]);

  return (
    <div className="agegate" role="dialog" aria-modal="true" aria-labelledby="agegate-title">
      <div className="agegate__panel">
        <Logo height={88} />
        {left ? (
          <>
            <h1 id="agegate-title" className="agegate__title">Adults only.</h1>
            <p className="agegate__text">Sorry — this website is only for adults aged 18 and over.</p>
            <button ref={yes} className="btn btn--ghost-light" onClick={() => setLeft(false)}>
              Go back
            </button>
          </>
        ) : (
          <>
            <p className="mono agegate__kicker">Age check — 18+</p>
            <h1 id="agegate-title" className="agegate__title">Are you 18 or older?</h1>
            <p className="agegate__text">This website sells nicotine products and is for adults aged 18 and over only.</p>
            <div className="agegate__actions">
              <button ref={yes} className="btn btn--blue btn--lg" onClick={onAccept}>
                I am 18 or older
              </button>
              <button className="btn btn--ghost-light btn--lg" onClick={() => setLeft(true)}>
                Leave
              </button>
            </div>
            <p className="agegate__warning mono">{nicotineWarning}</p>
          </>
        )}
      </div>
    </div>
  );
}
