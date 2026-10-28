import { Link } from '../lib/router.jsx';
import { waLink } from '../lib/whatsapp.js';
import { WhatsAppIcon, ArrowIcon } from './Icons.jsx';
import { useReveal } from '../lib/useScrollFx.js';
import Smoke from './Smoke.jsx';

// Closing band on the content pages: the two ways to order, side by side.
export default function OrderCta({ title = 'Ready when you are.' }) {
  const ref = useReveal();
  return (
    <section className="cta" aria-labelledby="cta-title">
      <Smoke density={2} />
      <div className="container cta__inner" ref={ref} data-reveal>
        <h2 id="cta-title" className="cta__title">{title}</h2>
        <div className="cta__actions">
          <Link className="btn btn--blue btn--lg" to="/shop">Shop the collection <ArrowIcon /></Link>
          <a className="btn btn--ghost-light btn--lg" href={waLink('Hi Vape Express, I would like to place an order.')} target="_blank" rel="noopener">
            <WhatsAppIcon className="wa-icon" /> Order on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
