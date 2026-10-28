import Logo from './Logo.jsx';
import { business } from '../config.js';
import { waLink } from '../lib/whatsapp.js';
import { Link } from '../lib/router.jsx';

export const NAV = [
  ['/shop', 'Shop'],
  ['/how-it-works', 'How to order'],
  ['/delivery', 'Delivery'],
  ['/contact', 'Contact'],
];

export default function Header({ count, onCart, path }) {
  const navLinks = NAV.map(([to, label]) => (
    <Link key={to} to={to} className={path === to ? 'is-active' : ''} aria-current={path === to ? 'page' : undefined}>
      {label}
    </Link>
  ));
  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <span>Deliveries around {business.city}</span>
          <span className="topbar__mid">Adults 18+ only</span>
          <a href={waLink()} target="_blank" rel="noopener">WhatsApp {business.whatsappDisplay}</a>
        </div>
      </div>
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="header__brand" aria-label="Vape Express home">
            <Logo height={40} />
          </Link>
          <nav aria-label="Main" className="header__nav">{navLinks}</nav>
          <button className="cartbtn" onClick={onCart} aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}>
            Cart <span key={count} className="cartbtn__count bump" aria-hidden="true">({String(count).padStart(2, '0')})</span>
          </button>
        </div>
        <nav aria-label="Pages" className="header__subnav container">{navLinks}</nav>
        <span className="header__progress" aria-hidden="true" />
      </header>
    </>
  );
}
