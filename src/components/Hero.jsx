import { useEffect, useRef, useState } from 'react';
import { WhatsAppIcon, ArrowIcon } from './Icons.jsx';
import { business, heroVideo } from '../config.js';
import { waLink } from '../lib/whatsapp.js';
import { money } from '../lib/format.js';
import Smoke from './Smoke.jsx';
import { Link } from '../lib/router.jsx';

// Cinematic hero: full-bleed background video (poster first, video fades in), a dark veil
// for legibility, the oversized headline, actions, live catalogue facts and a featured card.
// The video is skipped for reduced motion / data saver and pauses when off screen.
export default function Hero({ featured, products, onOpen }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [videoOk, setVideoOk] = useState(false);
  const [useVideo] = useState(() => {
    if (!heroVideo.enabled || typeof window === 'undefined') return false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !reduce && !navigator.connection?.saveData;
  });

  useEffect(() => {
    const v = videoRef.current;
    const el = sectionRef.current;
    if (!v || !el) return;
    let onScreen = true;
    const sync = () => (onScreen && !document.hidden ? v.play().catch(() => {}) : v.pause());
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [useVideo]);

  const prices = products.map((p) => p.price).filter((n) => n != null);
  const from = prices.length ? Math.min(...prices) : null;
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
  const brandList = brands.length > 1 ? `${brands.slice(0, -1).join(', ')} and ${brands.at(-1)}` : brands[0];

  return (
    <section id="top" className="hero" aria-labelledby="hero-title" ref={sectionRef}>
      <div className="hero__bg" aria-hidden="true">
        <img className="hero__poster" src={heroVideo.poster} alt="" fetchPriority="high" />
        {useVideo && (
          <video
            ref={videoRef}
            className={`hero__video ${videoOk ? 'is-ready' : ''}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={heroVideo.poster}
            onPlaying={() => setVideoOk(true)}
          >
            <source src={heroVideo.webm} type="video/webm" />
            <source src={heroVideo.mp4} type="video/mp4" />
          </video>
        )}
        <span className="hero__veil" />
      </div>
      <Smoke density={2} />

      <div className="container hero__inner">
        <p className="hero__kicker mono">
          <span>Vape Express — {business.tagline}</span>
          <span className="hero__kicker-end">{business.city}, {business.country} · Adults 18+</span>
        </p>

        <h1 id="hero-title" className="hero__title">
          <span className="hline"><span>Premium</span></span>
          <span className="hline"><span>vapes,</span></span>
          <span className="hline hline--accent"><span>delivered.</span></span>
        </h1>

        <div className="hero__grid">
          <div className="hero__body">
            <p className="hero__lead">
              {brandList ? `${brandList}, delivered across ${business.city}.` : `Delivered across ${business.city}.`}{' '}
              Choose your flavour, send your order in a few taps, and we confirm stock, payment and
              delivery with you personally on WhatsApp.
            </p>
            <div className="hero__ctas">
              <Link className="btn btn--blue btn--lg" to="/shop">Shop the collection <ArrowIcon /></Link>
              <a className="btn btn--ghost-light btn--lg" href={waLink('Hi Vape Express, I would like to place an order.')} target="_blank" rel="noopener">
                <WhatsAppIcon className="wa-icon" /> Order on WhatsApp
              </a>
            </div>
            {products.length > 0 && (
              <dl className="hero__meta mono">
                <div><dt>In stock list</dt><dd>{String(products.length).padStart(2, '0')} products</dd></div>
                {from != null && <div><dt>Prices from</dt><dd>{money(from)}</dd></div>}
                <div><dt>Payment</dt><dd>Arranged on WhatsApp</dd></div>
              </dl>
            )}
          </div>

          {featured && (
            <button type="button" className="hero__feature" onClick={() => onOpen?.(featured)} aria-label={`Featured: ${featured.name}, ${money(featured.price)}. View details`}>
              <img src={featured.image} alt="" width="160" height="160" />
              <span className="hero__feature-text">
                <span className="mono">Featured</span>
                <strong>{featured.name}</strong>
                <span className="hero__feature-price">{money(featured.price)}</span>
              </span>
              <ArrowIcon className="hero__feature-arrow" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
