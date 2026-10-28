import { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';
import { WhatsAppIcon } from './Icons.jsx';
import { business, heroVideo } from '../config.js';
import { waLink } from '../lib/whatsapp.js';
import { money } from '../lib/format.js';

// Hero with a short native entrance (CSS, ~1.4s) and an optional background video.
// Content is fully visible in the initial HTML; motion is opacity/transform only and
// is removed entirely for prefers-reduced-motion. See .hero rules in styles.css.
export default function Hero({ featured }) {
  const videoRef = useRef(null);
  const [videoOk, setVideoOk] = useState(false);
  const [useVideo] = useState(() => {
    if (!heroVideo.enabled || typeof window === 'undefined') return false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData;
    return !reduce && !saveData;
  });

  // Pause ambient video while the tab is hidden.
  useEffect(() => {
    const onVis = () => {
      document.documentElement.classList.toggle('is-hidden', document.hidden);
      const v = videoRef.current;
      if (!v) return;
      document.hidden ? v.pause() : v.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        {useVideo && (
          <video
            ref={videoRef}
            className={`hero__video ${videoOk ? 'is-ready' : ''}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroVideo.poster}
            onCanPlay={() => setVideoOk(true)}
            onError={() => setVideoOk(false)}
          >
            <source src={heroVideo.webm} type="video/webm" />
            <source src={heroVideo.mp4} type="video/mp4" />
          </video>
        )}
        <span className="hero__sweep" />
        <span className="hero__wisp hero__wisp--1" />
        <span className="hero__wisp hero__wisp--2" />
        <span className="hero__shade" />
      </div>

      <div className="container hero__grid">
        <div className="hero__copy">
          <div className="hero__logo intro intro--1"><Logo height={112} hideFallback /></div>
          <p className="eyebrow intro intro--2">Harare delivery · Adults 18+</p>
          <h1 id="hero-title" className="hero__title intro intro--2">{business.tagline}</h1>
          <p className="hero__lead intro intro--3">
            Premium products. Clean style. Pick your flavour, send your order on WhatsApp and we’ll
            confirm payment and delivery around Harare.
          </p>
          <div className="hero__ctas intro intro--4">
            <a className="btn btn--primary btn--lg" href="#shop">Shop now</a>
            <a className="btn btn--whatsapp btn--lg" href={waLink('Hi Vape Express, I would like to place an order.')} target="_blank" rel="noopener">
              <WhatsAppIcon /> Order on WhatsApp
            </a>
          </div>
        </div>

        {featured && (
          <figure className="hero__product intro intro--product">
            <span className="hero__halo" aria-hidden="true" />
            <img src={featured.heroImage ?? featured.image} alt={featured.name} width="720" height="880" fetchPriority="high" />
            <figcaption>
              <span>
                <span className="muted small">Featured</span>
                <strong>{featured.name}</strong>
              </span>
              <span className="pricepill pricepill--static">{money(featured.price)}</span>
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
