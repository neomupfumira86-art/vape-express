import { BagIcon, InfoIcon, WhatsAppIcon } from './Icons.jsx';
import { money } from '../lib/format.js';
import { waLink } from '../lib/whatsapp.js';

const GridIcon = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" /><rect x="13.5" y="4" width="6.5" height="6.5" /><rect x="4" y="13.5" width="6.5" height="6.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" />
  </svg>
);

// Always-visible bottom bar on phones: the four things a visitor needs, one tap away.
export default function MobileBar({ active, count, total, onCart }) {
  return (
    <nav className="mbar" aria-label="Quick actions">
      <a href="#shop" className={active === 'shop' ? 'is-active' : ''} aria-current={active === 'shop' ? 'location' : undefined}>
        <GridIcon />
        <span>Shop</span>
      </a>
      <a href="#how-it-works" className={active === 'how-it-works' ? 'is-active' : ''} aria-current={active === 'how-it-works' ? 'location' : undefined}>
        <InfoIcon />
        <span>How to order</span>
      </a>
      <button type="button" className={`mbar__cart ${count ? 'has-items' : ''}`} onClick={onCart} aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}>
        <BagIcon />
        <span>{count ? `${count} · ${money(total)}` : 'Cart'}</span>
      </button>
      <a href={waLink('Hi Vape Express, I would like to place an order.')} target="_blank" rel="noopener">
        <WhatsAppIcon className="wa-icon" />
        <span>WhatsApp</span>
      </a>
    </nav>
  );
}
