import { BagIcon, InfoIcon, WhatsAppIcon } from './Icons.jsx';
import { money } from '../lib/format.js';
import { waLink } from '../lib/whatsapp.js';
import { Link } from '../lib/router.jsx';

const GridIcon = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" /><rect x="13.5" y="4" width="6.5" height="6.5" /><rect x="4" y="13.5" width="6.5" height="6.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" />
  </svg>
);

// Always-visible bottom bar on phones: the four things a visitor needs, one tap away.
export default function MobileBar({ path, count, total, onCart }) {
  const item = (to, Icon, label) => (
    <Link to={to} className={path === to ? 'is-active' : ''} aria-current={path === to ? 'page' : undefined}>
      <Icon />
      <span>{label}</span>
    </Link>
  );
  return (
    <nav className="mbar" aria-label="Quick actions">
      {item('/shop', GridIcon, 'Shop')}
      {item('/how-it-works', InfoIcon, 'How to order')}
      <button type="button" className={`mbar__cart ${count ? 'has-items' : ''}`} onClick={onCart} aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}>
        <BagIcon />
        <span key={count} className="bump">{count ? `${count} · ${money(total)}` : 'Cart'}</span>
      </button>
      <a href={waLink('Hi Vape Express, I would like to place an order.')} target="_blank" rel="noopener">
        <WhatsAppIcon className="wa-icon" />
        <span>WhatsApp</span>
      </a>
    </nav>
  );
}
