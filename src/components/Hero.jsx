import { useEffect, useRef, useState } from 'react';
import { WhatsAppIcon, ArrowIcon } from './Icons.jsx';
import { business, heroVideo } from '../config.js';
import { waLink } from '../lib/whatsapp.js';
import { money } from '../lib/format.js';
import Smoke from './Smoke.jsx';

// Cinematic hero: oversized expanded headline over a dark ground, then copy + actions
// beside one tall product image. The optional hero video (config.heroVideo) replaces the
// image when it loads; reduced motion keeps the still image.
export default function Hero({ featured, products }) {
  const videoRef = useRef(null);
  const [videoOk, setVideoOk] = useState(false);
  const [useVideo] = useState(() => {
    if (!heroVideo.enabled || typeof window === 'undefined') return false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !reduce && !navigator.connection?.saveData;
  });

  useEffect(() => {
    const onVis = () => {
      const v = videoRef.current;
      if (v) document.hidden ? v.pause() : v.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const prices = products.map((p) => p.price).filter((n) => n != null);
  const from = prices.length ? Math.min(...prices) : null;
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <Smoke />
      <div className="container">
        <p className="hero__kicker mono">
          <span>Vape Express</span>
          <span>{business.city}, {business.country}</span>
        </p>
        <h1 id="hero-title" className="hero__title">
          <span className="hline"><span>Your Vape.</span></span>
          <span className="hline hline--accent"><span>Delivered.</span></span>
        </h1>

        <div className="hero__grid">
          <div className="hero__body">
            <p className="hero__lead">
              Premium vapes and pods, delivered around {business.city}. Choose your flavour, send your order on
              WhatsApp, and we confirm stock, payment and delivery with you directly.
            </p>
            <div className="hero__ctas">
              <a className="btn btn--blue btn--lg" href="#shop">Shop the range <ArrowIcon /></a>
              <a className="btn btn--ghost-light btn--lg" href={waLink('Hi Vape Express, I would like to place an order.')} target="_blank" rel="noopener">
                <WhatsAppIcon className="wa-icon" /> Order on WhatsApp
              </a>
            </div>
            {products.length > 0 && (
              <dl className="hero__meta mono">
                <div><dt>Products</dt><dd>{String(products.length).padStart(2, '0')}</dd></div>
                {from != null && <div><dt>From</dt><dd>{money(from)}</dd></div>}
                <div><dt>Brands</dt><dd>{brands.join(' / ')}</dd></div>
              </dl>
            )}
          </div>

          {featured && (
            <figure className="hero__media">
              <div className="hero__frame">
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
                <figcaption className="hero__caption mono">
                  <span>Featured — {featured.name}</span>
                  <span>{money(featured.price)}</span>
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
