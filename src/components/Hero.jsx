import { useEffect, useRef, useState } from 'react';
import { WhatsAppIcon, PinIcon, ChatIcon, ShieldIcon } from './Icons.jsx';
import { business, heroVideo } from '../config.js';
import { waLink } from '../lib/whatsapp.js';
import { money } from '../lib/format.js';

const facts = [
  [PinIcon, 'Deliveries around Harare'],
  [ChatIcon, 'Order on WhatsApp'],
  [ShieldIcon, 'Adults 18+ only'],
];

// Split hero: copy + actions on a light canvas, one navy product panel.
// The optional hero video (config.heroVideo) plays inside the panel; if it is missing
// or motion is reduced, the featured product photo is shown instead.
export default function Hero({ featured }) {
  const videoRef = useRef(null);
  const [videoOk, setVideoOk] = useState(false);
  const [useVideo] = useState(() => {
    if (!heroVideo.enabled || typeof window === 'undefined') return false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !reduce && !navigator.connection?.saveData;
  });

  // Pause the video while the tab is hidden.
  useEffect(() => {
    const onVis = () => {
      const v = videoRef.current;
      if (v) document.hidden ? v.pause() : v.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="label reveal">Harare delivery · Adults 18+</p>
          <h1 id="hero-title" className="hero__title reveal reveal--2">{business.tagline}</h1>
          <p className="hero__lead reveal reveal--3">
            Premium vapes and pods, delivered around Harare. Choose your flavour, send your order on
            WhatsApp, and we confirm stock, payment and delivery with you directly.
          </p>
          <div className="hero__ctas reveal reveal--3">
            <a className="btn btn--primary btn--lg" href="#shop">Shop now</a>
            <a className="btn btn--secondary btn--lg" href={waLink('Hi Vape Express, I would like to place an order.')} target="_blank" rel="noopener">
              <WhatsAppIcon className="wa-icon" /> Order on WhatsApp
            </a>
          </div>
          <ul className="hero__facts reveal reveal--4">
            {facts.map(([Icon, text]) => (
              <li key={text}><Icon /> {text}</li>
            ))}
          </ul>
        </div>

        {featured && (
          <figure className="hero__panel reveal reveal--media">
            <div className="hero__media">
              <img src={featured.heroImage ?? featured.image} alt={featured.name} width="720" height="880" fetchPriority="high" />
              {useVideo && (
                <video
                  ref={videoRef}
                  className={`hero__video ${videoOk ? 'is-ready' : ''}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  onCanPlay={() => setVideoOk(true)}
                >
                  <source src={heroVideo.webm} type="video/webm" />
                  <source src={heroVideo.mp4} type="video/mp4" />
                </video>
              )}
            </div>
            {!videoOk && (
              <figcaption className="hero__caption">
                <span>
                  <span className="hero__caption-label">Featured</span>
                  <strong>{featured.name}</strong>
                </span>
                <span className="hero__price">{money(featured.price)}</span>
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </section>
  );
}
