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
        <Logo height={96} />
        {left ? (
          <>
            <h1 id="agegate-title" className="agegate__title">Adults only</h1>
            <p className="muted">Sorry — this website is only for adults aged 18 and over.</p>
            <button ref={yes} className="btn btn--secondary" onClick={() => setLeft(false)}>
              Go back
            </button>
          </>
        ) : (
          <>
            <p className="label">Age check</p>
            <h1 id="agegate-title" className="agegate__title">Are you 18 or older?</h1>
            <p className="muted">This website sells nicotine products and is for adults aged 18+ only.</p>
            <div className="agegate__actions">
              <button ref={yes} className="btn btn--primary" onClick={onAccept}>
                I am 18 or older
              </button>
              <button className="btn btn--secondary" onClick={() => setLeft(true)}>
                Leave
              </button>
            </div>
            <p className="agegate__warning">{nicotineWarning}</p>
          </>
        )}
      </div>
    </div>
  );
}
